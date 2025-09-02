# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# Add any project specific keep options here:

-keepattributes *Annotation*

# Razorpay rules
-dontwarn com.razorpay.**
-keep class com.razorpay.** {*;}
-optimizations !method/inlining/
-keepclasseswithmembers class * {
  public void onPayment*(...);
}

# Fix for ThrowableExtension missing class
-keep class com.google.devtools.build.android.desugar.runtime.ThrowableExtension { *; }
-dontwarn com.google.devtools.build.android.desugar.runtime.ThrowableExtension

# Agora SDK rules 
-keep class io.agora.** { *; }
-dontwarn io.agora.**

# General desugar rules
-keep class com.google.devtools.build.android.desugar.runtime.** { *; }
-dontwarn com.google.devtools.build.android.desugar.runtime.**

# React Native general rules
-keep class com.facebook.react.** { *; }
-keep class com.facebook.hermes.** { *; }
-keep class com.facebook.jni.** { *; }

# TrueCall library rules
-keep class ** { *; }
-dontwarn kartikbhalla_react-native-truecaller.**