#!/usr/bin/env python3
"""
MediaSense - Intelligent Media Playback Manager for GNOME
Automatically manages playback between different media sources using MPRIS.
"""

from pathlib import Path
from dataclasses import dataclass, asdict
from typing import Dict, List, Optional, Set
import sys
import signal
import os
import logging
import threading
import time
import json
import subprocess
from gi.repository import Gtk, GLib, Notify, Gio, AppIndicator3
import gi
# Declare GI versions BEFORE importing from gi.repository
gi.require_version('Gtk', '3.0')
gi.require_version('AppIndicator3', '0.1')
gi.require_version('Notify', '0.7')
gi.require_version('Gio', '2.0')


# Ensure log directory exists before configuring logging
log_dir = Path.home() / '.local' / 'share' / 'mediasense'
log_dir.mkdir(parents=True, exist_ok=True)
log_file = log_dir / 'mediasense.log'

# Configure logging (file only, no console output to save RAM)
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(log_file)
    ]
)
logger = logging.getLogger('MediaSense')


@dataclass
class MediaPlayer:
    """Represents a media player with its current state."""
    name: str
    instance: str
    status: str  # Playing, Paused, Stopped
    title: str
    artist: str
    priority: int
    is_browser: bool = False
    last_seen: float = 0.0
    was_playing_before_pause: bool = False


class MediaSenseConfig:
    """Configuration management for MediaSense."""

    def __init__(self):
        self.config_dir = Path.home() / '.config' / 'mediasense'
        self.config_file = self.config_dir / 'config.json'
        self.config_dir.mkdir(parents=True, exist_ok=True)

        self.default_config = {
            'priorities': {
                'firefox': 1,
                'chromium': 1,
                'chrome': 1,
                'spotify': 2,
                'vlc': 3,
                'rhythmbox': 4,
                'audacious': 5
            },
            'browser_priority': True,
            'notification_enabled': True,
            'pause_all_enabled': False,
            'check_interval': 1.0,
            'browser_patterns': ['firefox', 'chromium', 'chrome', 'brave']
        }

        self.config = self.load_config()

    def load_config(self) -> dict:
        """Load configuration from file or create default."""
        try:
            if self.config_file.exists():
                with open(self.config_file, 'r') as f:
                    config = json.load(f)
                # Merge with defaults for any missing keys
                for key, value in self.default_config.items():
                    if key not in config:
                        config[key] = value
                return config
            else:
                self.save_config(self.default_config)
                return self.default_config.copy()
        except Exception as e:
            logger.error(f"Error loading config: {e}")
            return self.default_config.copy()

    def save_config(self, config: dict = None):
        """Save configuration to file."""
        try:
            config_to_save = config or self.config
            with open(self.config_file, 'w') as f:
                json.dump(config_to_save, f, indent=2)
        except Exception as e:
            logger.error(f"Error saving config: {e}")


class MediaSenseCore:
    """Core media management logic."""

    def __init__(self, config: MediaSenseConfig):
        self.config = config
        self.players: Dict[str, MediaPlayer] = {}
        self.last_active_player: Optional[str] = None
        self.paused_by_mediasense: Set[str] = set()
        self.manually_paused: Set[str] = set()
        self.last_playing_states: Dict[str, str] = {}
        self.update_gui_callback = None
        self.running = False

        # Initialize notifications
        Notify.init("MediaSense")

    def set_update_gui_callback(self, callback):
        self.update_gui_callback = callback

    def get_players(self) -> List[MediaPlayer]:
        """Get all available MPRIS players."""
        try:
            result = subprocess.run(
                ['playerctl', '--list-all'],
                capture_output=True,
                text=True,
                timeout=5
            )

            if result.returncode != 0:
                logger.warning(
                    f"playerctl --list-all failed with return code: {result.returncode}")
                return []

            player_instances = result.stdout.strip().split('\n')
            logger.info(f"Found player instances: {player_instances}")
            players = []
            current_time = time.time()

            for instance in player_instances:
                if not instance:
                    continue

                try:
                    # Get player status
                    status_result = subprocess.run(
                        ['playerctl', '--player', instance, 'status'],
                        capture_output=True,
                        text=True,
                        timeout=2
                    )

                    if status_result.returncode != 0:
                        continue

                    status = status_result.stdout.strip()

                    # Get metadata
                    title = self._get_metadata(instance, 'title') or 'Unknown'
                    artist = self._get_metadata(
                        instance, 'artist') or 'Unknown'

                    # Determine player name and priority
                    player_name = instance.split('.')[0].lower()
                    is_browser = any(
                        browser in player_name for browser in self.config.config['browser_patterns'])
                    priority = self.config.config['priorities'].get(
                        player_name, 10)

                    player = MediaPlayer(
                        name=player_name,
                        instance=instance,
                        status=status,
                        title=title,
                        artist=artist,
                        priority=priority,
                        is_browser=is_browser,
                        last_seen=current_time
                    )

                    logger.debug(f"Created player: {player}")
                    players.append(player)

                except subprocess.TimeoutExpired:
                    logger.warning(
                        f"Timeout getting info for player {instance}")
                    continue
                except Exception as e:
                    logger.error(
                        f"Error getting player info for {instance}: {e}")
                    continue

            return players

        except Exception as e:
            logger.error(f"Error getting players: {e}")
            return []

    def _get_metadata(self, instance: str, key: str) -> Optional[str]:
        """Get metadata for a player instance."""
        try:
            result = subprocess.run(
                ['playerctl', '--player', instance,
                    'metadata', f'--format={{{{ {key} }}}}'],
                capture_output=True,
                text=True,
                timeout=2
            )

            if result.returncode == 0:
                value = result.stdout.strip()
                return value if value and value != '{{ ' + key + ' }}' else None

        except Exception:
            pass

        return None

    def pause_player(self, instance: str):
        """Pause a specific player."""
        try:
            subprocess.run(
                ['playerctl', '--player', instance, 'pause'],
                timeout=2,
                check=False
            )
            self.paused_by_mediasense.add(instance)
            # Remove from manually paused since we're pausing it
            self.manually_paused.discard(instance)
            logger.info(f"Paused player: {instance}")
        except Exception as e:
            logger.error(f"Error pausing player {instance}: {e}")

    def resume_player(self, instance: str):
        """Resume a specific player."""
        try:
            subprocess.run(
                ['playerctl', '--player', instance, 'play'],
                timeout=2,
                check=False
            )
            self.paused_by_mediasense.discard(instance)
            self.manually_paused.discard(instance)
            logger.info(f"Resumed player: {instance}")
        except Exception as e:
            logger.error(f"Error resuming player {instance}: {e}")

    def manage_playback(self):
        """Main logic for managing media playback."""
        logger.debug("Running manage_playback()")
        players = self.get_players()
        logger.debug(f"Found {len(players)} players")

        # Track status changes to detect manual pauses
        current_states = {p.instance: p.status for p in players}
        for instance, current_status in current_states.items():
            previous_status = self.last_playing_states.get(instance)

            # If a player went from Playing to Paused and we didn't pause it
            if (previous_status == 'Playing' and current_status == 'Paused'
                    and instance not in self.paused_by_mediasense):
                self.manually_paused.add(instance)
                logger.info(f"Detected manual pause: {instance}")

            # If a player went from Paused to Playing, remove from manual pause set
            elif previous_status == 'Paused' and current_status == 'Playing':
                self.manually_paused.discard(instance)
                self.paused_by_mediasense.discard(instance)

        self.last_playing_states = current_states.copy()

        # Update players dict
        self.players = {p.instance: p for p in players}
        logger.debug(f"Updated players dict with {len(self.players)} players")

        # Pause all media if the setting is enabled
        if self.config.config.get('pause_all_enabled', False):
            logger.debug("Pause all enabled, pausing all playing media")
            for p in players:
                if p.status == 'Playing':
                    self.pause_player(p.instance)
            # Always update GUI, even when pausing all
            if self.update_gui_callback:
                logger.debug("Triggering GUI update callback (pause all mode)")
                GLib.idle_add(self.update_gui_callback)
            return

        # Find P1 (priority 1) and other players
        p1 = next((p for p in players if p.priority == 1), None)
        other_players = [p for p in players if p.priority != 1]
        logger.debug(f"P1 player: {p1}, Other players: {len(other_players)}")

        if not p1:
            # No P1, just allow all others to play
            logger.debug("No P1 player found, allowing others to play")
            # Still update GUI
            if self.update_gui_callback:
                logger.debug("Triggering GUI update callback (no P1)")
                GLib.idle_add(self.update_gui_callback)
            return

        if p1.status == 'Playing':
            # Pause all other players if P1 is playing
            for player in other_players:
                if player.status == 'Playing':
                    self.pause_player(player.instance)
        elif p1.status == 'Paused':
            # If P1 is paused manually, allow one other media to play
            playing_others = [
                p for p in other_players if p.status == 'Playing']
            if not playing_others:
                # Only auto-resume if there is a paused other media that was NOT manually paused
                paused_others = [
                    p for p in other_players
                    if p.status == 'Paused' and p.instance not in self.manually_paused
                ]
                if paused_others:
                    self.resume_player(paused_others[0].instance)
            # If you pause the other media manually, it stays paused (do nothing)

        # No need to sort or enforce further priority, since only one other media is allowed
        # Update last active player for notification
        playing_players = [p for p in players if p.status == 'Playing']
        if playing_players:
            primary_player = playing_players[0]
            if self.last_active_player != primary_player.instance:
                self.last_active_player = primary_player.instance
                if self.config.config['notification_enabled']:
                    self._send_notification(
                        f"Now Playing: {primary_player.name.title()}",
                        f"{primary_player.title} - {primary_player.artist}"
                    )

        # Always update GUI, even if no players are playing
        if self.update_gui_callback:
            logger.debug("Triggering GUI update callback")
            GLib.idle_add(self.update_gui_callback)

    def _send_notification(self, title: str, message: str):
        """Send a desktop notification."""
        try:
            notification = Notify.Notification.new(
                title, message, "audio-x-generic")
            notification.show()
        except Exception as e:
            logger.error(f"Error sending notification: {e}")

    def start_monitoring(self):
        """Start the media monitoring loop."""
        self.running = True

        def monitor_loop():
            while self.running:
                try:
                    self.manage_playback()
                    time.sleep(self.config.config['check_interval'])
                except Exception as e:
                    logger.error(f"Error in monitoring loop: {e}")
                    time.sleep(5)  # Wait longer on error

        self.monitor_thread = threading.Thread(
            target=monitor_loop, daemon=True)
        self.monitor_thread.start()
        logger.info("MediaSense monitoring started")

    def stop_monitoring(self):
        """Stop the media monitoring loop."""
        self.running = False
        logger.info("MediaSense monitoring stopped")


class MediaSenseGUI(Gtk.Application):
    """GTK3-based GUI for MediaSense."""

    def __init__(self, core: MediaSenseCore, config: MediaSenseConfig):
        super().__init__(application_id='com.mediasense.app')
        self.core = core
        self.config = config
        self.window = None
        self.status_label = None
        self.detector_status_label = None

        # Connect signals
        self.connect('activate', self.on_activate)

        # Update status periodically
        GLib.timeout_add_seconds(3, self.update_status)

    def on_activate(self, app):
        """Called when the application is activated."""
        if not self.window:
            self.create_window()
        self.window.show_all()

    def create_window(self):
        """Create the main application window."""
        self.window = Gtk.ApplicationWindow(application=self)
        self.window.set_title("MediaSense")
        self.window.set_default_size(400, 300)

        # Set custom icon for dock/taskbar
        icon_path = os.path.join(os.path.dirname(__file__), "iconMedia.png")
        try:
            self.window.set_icon_from_file(icon_path)
        except Exception as e:
            logger.warning(f"Could not load custom icon: {e}")

        # Create header bar
        header = Gtk.HeaderBar()
        header.set_title("MediaSense")
        self.window.set_titlebar(header)

        # Create main box
        main_box = Gtk.Box(orientation=Gtk.Orientation.VERTICAL, spacing=10)
        main_box.set_margin_top(10)
        main_box.set_margin_bottom(10)
        main_box.set_margin_start(10)
        main_box.set_margin_end(10)

        # Detector status label
        self.detector_status_label = Gtk.Label(
            label="MediaSense Detector: OFF")
        self.detector_status_label.set_halign(Gtk.Align.START)
        main_box.pack_start(self.detector_status_label, False, False, 0)

        # Playing status label
        self.status_label = Gtk.Label(label="MediaSense: Starting...")
        self.status_label.set_halign(Gtk.Align.START)
        main_box.pack_start(self.status_label, False, False, 0)

        # Players list
        players_frame = Gtk.Frame(label="Active Players")
        self.players_box = Gtk.Box(
            orientation=Gtk.Orientation.VERTICAL, spacing=5)
        self.players_box.set_margin_top(10)
        self.players_box.set_margin_bottom(10)
        self.players_box.set_margin_start(10)
        self.players_box.set_margin_end(10)

        scrolled = Gtk.ScrolledWindow()
        scrolled.set_policy(Gtk.PolicyType.NEVER, Gtk.PolicyType.AUTOMATIC)
        scrolled.add(self.players_box)
        scrolled.set_vexpand(True)

        players_frame.add(scrolled)
        main_box.pack_start(players_frame, True, True, 0)

        # Button box for Settings and Quit
        button_box = Gtk.Box(
            orientation=Gtk.Orientation.HORIZONTAL, spacing=10)

        # Settings button
        settings_button = Gtk.Button(label="Settings")
        settings_button.connect("clicked", self.show_settings)
        button_box.pack_start(settings_button, False, False, 0)

        # Quit button
        quit_button = Gtk.Button(label="Quit")
        quit_button.connect("clicked", lambda btn: self.quit())
        button_box.pack_start(quit_button, False, False, 0)

        main_box.pack_start(button_box, False, False, 0)

        self.window.add(main_box)

    def update_status(self):
        """Update the status display."""
        logger.debug("Updating GUI status...")
        try:
            # Update detector status label
            if self.detector_status_label:
                detector_status = "ON" if self.core.running else "OFF"
                self.detector_status_label.set_text(
                    f"MediaSense Detector: {detector_status}")

            # Update playing status label
            if self.core.last_active_player:
                player = self.core.players.get(self.core.last_active_player)
                if player:
                    status_text = f"Playing: {player.name.title()}"
                else:
                    status_text = "MediaSense: No active player"
            else:
                status_text = "MediaSense: No active player"

            if self.status_label:
                self.status_label.set_text(status_text)

            # Update players list
            if self.players_box:
                # Clear existing widgets
                for child in self.players_box.get_children():
                    self.players_box.remove(child)

                if self.core.running and self.core.players:
                    logger.debug(
                        f"Updating GUI with {len(self.core.players)} players")
                    for player in self.core.players.values():
                        logger.debug(
                            f"Player: {player.name}, Status: {player.status}, Title: {player.title}")
                        status_icon = "▶" if player.status == "Playing" else "⏸" if player.status == "Paused" else "⏹"

                        # Add priority and pause reason info
                        pause_info = ""
                        if player.status == "Paused":
                            if player.instance in self.core.paused_by_mediasense:
                                pause_info = " (auto-paused)"
                            elif player.instance in self.core.manually_paused:
                                pause_info = " (manually paused)"

                        max_len = 40
                        title = (
                            player.title[:max_len] + '...') if len(player.title) > max_len else player.title
                        label_text = f"{status_icon} [P{player.priority}] {player.name.title()}: {title}{pause_info}"

                        label = Gtk.Label(label=label_text)
                        label.set_halign(Gtk.Align.START)
                        self.players_box.pack_start(label, False, False, 0)

                    # Show all the new labels
                    self.players_box.show_all()
                elif self.core.running:
                    no_players_label = Gtk.Label(label="No players found")
                    no_players_label.set_halign(Gtk.Align.START)
                    self.players_box.pack_start(
                        no_players_label, False, False, 0)
                    self.players_box.show_all()
                else:
                    detector_off_label = Gtk.Label(
                        label="Detector is OFF - Turn on to see players")
                    detector_off_label.set_halign(Gtk.Align.START)
                    self.players_box.pack_start(
                        detector_off_label, False, False, 0)
                    self.players_box.show_all()

        except Exception as e:
            logger.error(f"Error updating status: {e}")

        return True  # Continue the timeout

    def show_settings(self, button=None):
        """Show the settings dialog."""
        dialog = Gtk.Window()
        dialog.set_title("MediaSense Settings")
        dialog.set_transient_for(self.window)
        dialog.set_default_size(400, 300)

        # Create main container
        main_box = Gtk.Box(orientation=Gtk.Orientation.VERTICAL, spacing=10)
        main_box.set_margin_top(10)
        main_box.set_margin_bottom(10)
        main_box.set_margin_start(10)
        main_box.set_margin_end(10)

        # Create settings widgets
        settings_box = Gtk.Box(
            orientation=Gtk.Orientation.VERTICAL, spacing=10)

        # Priority settings frame
        priority_frame = Gtk.Frame(label="Player Priorities (1 = highest)")
        priority_box = Gtk.Box(orientation=Gtk.Orientation.VERTICAL, spacing=5)
        priority_box.set_margin_top(10)
        priority_box.set_margin_bottom(10)
        priority_box.set_margin_start(10)
        priority_box.set_margin_end(10)

        self.priority_entries = {}
        for player_name, priority in self.config.config['priorities'].items():
            row_box = Gtk.Box(
                orientation=Gtk.Orientation.HORIZONTAL, spacing=10)

            label = Gtk.Label(label=f"{player_name.title()}:")
            label.set_size_request(100, -1)
            label.set_halign(Gtk.Align.START)
            row_box.pack_start(label, False, False, 0)

            entry = Gtk.SpinButton()
            entry.set_range(1, 99)
            entry.set_increments(1, 1)
            entry.set_value(priority)
            self.priority_entries[player_name] = entry
            row_box.pack_start(entry, False, False, 0)

            priority_box.pack_start(row_box, False, False, 0)

        priority_frame.add(priority_box)
        settings_box.pack_start(priority_frame, False, False, 0)

        # Notifications checkbox
        notifications_check = Gtk.CheckButton(label="Enable notifications")
        notifications_check.set_active(
            self.config.config['notification_enabled'])
        settings_box.pack_start(notifications_check, False, False, 0)

        main_box.pack_start(settings_box, False, False, 0)

        # Pause All check
        pause_all_check = Gtk.CheckButton(
            label="Pause all media (including P1)")
        pause_all_check.set_active(
            self.config.config.get('pause_all_enabled', False))
        settings_box.pack_start(pause_all_check, False, False, 0)

        # Create button box
        button_box = Gtk.Box(
            orientation=Gtk.Orientation.HORIZONTAL, spacing=10)
        button_box.set_halign(Gtk.Align.END)

        # Cancel button
        cancel_button = Gtk.Button(label="Cancel")
        cancel_button.connect("clicked", lambda btn: dialog.destroy())
        button_box.pack_start(cancel_button, False, False, 0)

        # OK button
        ok_button = Gtk.Button(label="OK")
        ok_button.connect("clicked", self.on_settings_ok, dialog,
                          notifications_check, pause_all_check)
        button_box.pack_start(ok_button, False, False, 0)

        main_box.pack_start(button_box, False, False, 0)
        dialog.add(main_box)

        dialog.show_all()

    def on_settings_ok(self, button, dialog, notifications_check, pause_all_check):
        """Handle settings OK button click."""
        # Save priority settings
        for player_name, entry in self.priority_entries.items():
            self.config.config['priorities'][player_name] = int(
                entry.get_value())

        # Save settings
        self.config.config['notification_enabled'] = notifications_check.get_active(
        )
        self.config.config['pause_all_enabled'] = pause_all_check.get_active(
        )
        self.config.save_config()

        dialog.destroy()


class MediaSenseTray:
    def __init__(self, core, gui):
        self.core = core
        self.gui = gui
        self.indicator = AppIndicator3.Indicator.new(
            "mediasense-indicator",
            "audio-x-generic",  # You can use a custom icon path here
            AppIndicator3.IndicatorCategory.APPLICATION_STATUS
        )
        self.indicator.set_status(AppIndicator3.IndicatorStatus.ACTIVE)
        self.indicator.set_menu(self.build_menu())
        self.is_on = False
        # Don't start monitoring automatically - let user control it

    def quit(self, _):
        self.core.stop_monitoring()
        self.gui.quit()  # Properly quit the Gtk.Application

    def build_menu(self):
        menu = Gtk.Menu()

        # On/Off toggle
        self.toggle_item = Gtk.MenuItem(label="Turn On")
        self.toggle_item.connect("activate", self.toggle_mediasense)
        menu.append(self.toggle_item)

        # Settings
        settings_item = Gtk.MenuItem(label="Settings")
        settings_item.connect("activate", self.show_settings)
        menu.append(settings_item)

        # Quit
        quit_item = Gtk.MenuItem(label="Quit")
        quit_item.connect("activate", self.quit)
        menu.append(quit_item)

        menu.show_all()
        return menu

    def toggle_mediasense(self, _):
        if self.is_on:
            self.core.stop_monitoring()
            self.toggle_item.set_label("Turn On")
            self.is_on = False
        else:
            self.core.start_monitoring()
            self.toggle_item.set_label("Turn Off")
            self.is_on = True

        # Immediately update GUI to reflect the new state
        if self.core.update_gui_callback:
            GLib.idle_add(self.core.update_gui_callback)

    def show_settings(self, _):
        self.gui.show_settings(None)


class MediaSenseApp:
    """Main MediaSense application."""

    def __init__(self):
        # Create data directory
        data_dir = Path.home() / '.local' / 'share' / 'mediasense'
        data_dir.mkdir(parents=True, exist_ok=True)

        # Initialize components
        self.config = MediaSenseConfig()
        self.core = MediaSenseCore(self.config)
        self.gui = MediaSenseGUI(self.core, self.config)
        self.tray = MediaSenseTray(self.core, self.gui)
        self.core.set_update_gui_callback(self.gui.update_status)

        # Setup signal handlers
        signal.signal(signal.SIGINT, self._signal_handler)
        signal.signal(signal.SIGTERM, self._signal_handler)

    def _signal_handler(self, signum, frame):
        """Handle system signals."""
        logger.info(f"Received signal {signum}, shutting down...")
        self.shutdown()

    def run(self):
        """Run the MediaSense application."""
        logger.info("Starting MediaSense...")

        # Check dependencies
        if not self._check_dependencies():
            return 1

        # Start GUI
        try:
            self.gui.run(sys.argv)
        except KeyboardInterrupt:
            logger.info("Interrupted by user")
            return 0

    def shutdown(self):
        """Shutdown the application."""
        self.core.stop_monitoring()
        if hasattr(self.gui, 'quit'):
            self.gui.quit()

    def _check_dependencies(self) -> bool:
        """Check if required dependencies are available."""
        try:
            subprocess.run(['playerctl', '--version'],
                           capture_output=True, check=True)
            return True
        except (subprocess.CalledProcessError, FileNotFoundError):
            logger.error(
                "playerctl is not installed. Please install it with: sudo pacman -S playerctl")
            return False


def main():
    """Main entry point."""
    app = MediaSenseApp()
    return app.run()


if __name__ == '__main__':
    sys.exit(main())
