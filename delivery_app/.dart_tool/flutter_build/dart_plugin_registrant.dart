//
// Generated file. Do not edit.
// This file is generated from template in file `flutter_tools/lib/src/flutter_plugins.dart`.
//

// @dart = 3.8

import 'dart:io'; // flutter_ignore: dart_io_import.
import 'package:geolocator_android/geolocator_android.dart';
import 'package:image_picker_android/image_picker_android.dart';
import 'package:path_provider_android/path_provider_android.dart';
import 'package:geolocator_apple/geolocator_apple.dart';
import 'package:image_picker_ios/image_picker_ios.dart';
import 'package:path_provider_foundation/path_provider_foundation.dart';
import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:file_selector_linux/file_selector_linux.dart';
import 'package:geolocator_linux/geolocator_linux.dart';
import 'package:image_picker_linux/image_picker_linux.dart';
import 'package:package_info_plus/package_info_plus.dart';
import 'package:path_provider_linux/path_provider_linux.dart';
import 'package:file_selector_macos/file_selector_macos.dart';
import 'package:geolocator_apple/geolocator_apple.dart';
import 'package:image_picker_macos/image_picker_macos.dart';
import 'package:path_provider_foundation/path_provider_foundation.dart';
import 'package:file_selector_windows/file_selector_windows.dart';
import 'package:image_picker_windows/image_picker_windows.dart';
import 'package:package_info_plus/package_info_plus.dart';
import 'package:path_provider_windows/path_provider_windows.dart';

@pragma('vm:entry-point')
class _PluginRegistrant {

  @pragma('vm:entry-point')
  static void register() {
    if (Platform.isAndroid) {
      try {
        GeolocatorAndroid.registerWith();
      } catch (err) {
        print(
          '`geolocator_android` threw an error: $err. '
          'The app may not function as expected until you remove this plugin from pubspec.yaml'
        );
      }

      try {
        ImagePickerAndroid.registerWith();
      } catch (err) {
        print(
          '`image_picker_android` threw an error: $err. '
          'The app may not function as expected until you remove this plugin from pubspec.yaml'
        );
      }

      try {
        PathProviderAndroid.registerWith();
      } catch (err) {
        print(
          '`path_provider_android` threw an error: $err. '
          'The app may not function as expected until you remove this plugin from pubspec.yaml'
        );
      }

    } else if (Platform.isIOS) {
      try {
        GeolocatorApple.registerWith();
      } catch (err) {
        print(
          '`geolocator_apple` threw an error: $err. '
          'The app may not function as expected until you remove this plugin from pubspec.yaml'
        );
      }

      try {
        ImagePickerIOS.registerWith();
      } catch (err) {
        print(
          '`image_picker_ios` threw an error: $err. '
          'The app may not function as expected until you remove this plugin from pubspec.yaml'
        );
      }

      try {
        PathProviderFoundation.registerWith();
      } catch (err) {
        print(
          '`path_provider_foundation` threw an error: $err. '
          'The app may not function as expected until you remove this plugin from pubspec.yaml'
        );
      }

    } else if (Platform.isLinux) {
      try {
        ConnectivityPlusLinuxPlugin.registerWith();
      } catch (err) {
        print(
          '`connectivity_plus` threw an error: $err. '
          'The app may not function as expected until you remove this plugin from pubspec.yaml'
        );
      }

      try {
        FileSelectorLinux.registerWith();
      } catch (err) {
        print(
          '`file_selector_linux` threw an error: $err. '
          'The app may not function as expected until you remove this plugin from pubspec.yaml'
        );
      }

      try {
        GeolocatorLinux.registerWith();
      } catch (err) {
        print(
          '`geolocator_linux` threw an error: $err. '
          'The app may not function as expected until you remove this plugin from pubspec.yaml'
        );
      }

      try {
        ImagePickerLinux.registerWith();
      } catch (err) {
        print(
          '`image_picker_linux` threw an error: $err. '
          'The app may not function as expected until you remove this plugin from pubspec.yaml'
        );
      }

      try {
        PackageInfoPlusLinuxPlugin.registerWith();
      } catch (err) {
        print(
          '`package_info_plus` threw an error: $err. '
          'The app may not function as expected until you remove this plugin from pubspec.yaml'
        );
      }

      try {
        PathProviderLinux.registerWith();
      } catch (err) {
        print(
          '`path_provider_linux` threw an error: $err. '
          'The app may not function as expected until you remove this plugin from pubspec.yaml'
        );
      }

    } else if (Platform.isMacOS) {
      try {
        FileSelectorMacOS.registerWith();
      } catch (err) {
        print(
          '`file_selector_macos` threw an error: $err. '
          'The app may not function as expected until you remove this plugin from pubspec.yaml'
        );
      }

      try {
        GeolocatorApple.registerWith();
      } catch (err) {
        print(
          '`geolocator_apple` threw an error: $err. '
          'The app may not function as expected until you remove this plugin from pubspec.yaml'
        );
      }

      try {
        ImagePickerMacOS.registerWith();
      } catch (err) {
        print(
          '`image_picker_macos` threw an error: $err. '
          'The app may not function as expected until you remove this plugin from pubspec.yaml'
        );
      }

      try {
        PathProviderFoundation.registerWith();
      } catch (err) {
        print(
          '`path_provider_foundation` threw an error: $err. '
          'The app may not function as expected until you remove this plugin from pubspec.yaml'
        );
      }

    } else if (Platform.isWindows) {
      try {
        FileSelectorWindows.registerWith();
      } catch (err) {
        print(
          '`file_selector_windows` threw an error: $err. '
          'The app may not function as expected until you remove this plugin from pubspec.yaml'
        );
      }

      try {
        ImagePickerWindows.registerWith();
      } catch (err) {
        print(
          '`image_picker_windows` threw an error: $err. '
          'The app may not function as expected until you remove this plugin from pubspec.yaml'
        );
      }

      try {
        PackageInfoPlusWindowsPlugin.registerWith();
      } catch (err) {
        print(
          '`package_info_plus` threw an error: $err. '
          'The app may not function as expected until you remove this plugin from pubspec.yaml'
        );
      }

      try {
        PathProviderWindows.registerWith();
      } catch (err) {
        print(
          '`path_provider_windows` threw an error: $err. '
          'The app may not function as expected until you remove this plugin from pubspec.yaml'
        );
      }

    }
  }
}
