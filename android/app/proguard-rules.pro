# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# Add any project specific keep options here:

# MMKV (JNI-backed storage) — keep native binding surface intact.
-keep class com.tencent.mmkv.** { *; }

# react-native-sound
-keep class com.zmxv.RNSound.** { *; }

# react-native-iap (Nitro-modules based) — keep generated bindings.
-keep class com.margelo.nitro.** { *; }
-keep class expo.modules.iap.** { *; }

# Google Mobile Ads / Play Services — WebView bridges used by rendered ads.
-keepattributes JavascriptInterface
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}
-keep class com.google.android.gms.ads.** { *; }

# Reanimated / Worklets — keep JNI + annotation-processed worklet classes.
-keep class com.swmansion.reanimated.** { *; }
-keep class com.swmansion.worklets.** { *; }

# Keep all native module classes discovered by RN's package list (annotation-
# driven bridge classes must survive across the codegen boundary).
-keep,allowobfuscation @interface com.facebook.proguard.annotations.DoNotStrip
-keep,allowobfuscation @interface com.facebook.proguard.annotations.KeepGettersAndSetters
-keep @com.facebook.proguard.annotations.DoNotStrip class *
-keepclassmembers class * {
    @com.facebook.proguard.annotations.DoNotStrip *;
    @com.facebook.proguard.annotations.KeepGettersAndSetters *;
}

# Silence R8 warnings for optional/transitive classes referenced by OkHttp
# and other deps that aren't actually on the runtime classpath at compile time.
-dontwarn okhttp3.**
-dontwarn okio.**
-dontwarn com.google.android.play.core.**
