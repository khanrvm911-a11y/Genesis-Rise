package com.genesis.app;

import android.os.Handler;
import android.os.Looper;
import android.view.View;
import android.view.ViewGroup;
import android.view.animation.Animation;
import android.view.animation.AnimationUtils;
import android.widget.FrameLayout;

import androidx.core.splashscreen.SplashScreen;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    private static final long MIN_SPLASH_MS = 800L;
    private static final long FADE_OUT_MS = 350L;

    private View splashOverlay;
    private boolean keepSplashOnScreen = true;
    private long splashStartTime;
    private boolean dismissRequested;
    private boolean dismissScheduled;
    private int dismissAttempts;

    private static final int MAX_DISMISS_ATTEMPTS = 80;

    @Override
    protected void onCreate(android.os.Bundle savedInstanceState) {
        splashStartTime = System.currentTimeMillis();
        registerPlugin(GenesisLaunchPlugin.class);

        SplashScreen splashScreen = SplashScreen.installSplashScreen(this);
        splashScreen.setKeepOnScreenCondition(() -> keepSplashOnScreen);

        super.onCreate(savedInstanceState);
        showAnimatedSplashOverlay();
    }

    private void showAnimatedSplashOverlay() {
        getWindow().getDecorView().post(() -> {
            if (splashOverlay != null) {
                return;
            }

            splashOverlay = getLayoutInflater().inflate(R.layout.splash_overlay, null);
            FrameLayout.LayoutParams params = new FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT
            );

            ViewGroup decorView = (ViewGroup) getWindow().getDecorView();
            decorView.addView(splashOverlay, params);

            View logo = splashOverlay.findViewById(R.id.splash_logo);
            View glow = splashOverlay.findViewById(R.id.splash_glow);

            Animation logoEnter = AnimationUtils.loadAnimation(this, R.anim.splash_logo_enter);
            logo.startAnimation(logoEnter);

            Animation glowPulse = AnimationUtils.loadAnimation(this, R.anim.splash_glow_breathe);
            glow.startAnimation(glowPulse);
        });
    }

    public void hideSplashOverlay() {
        dismissRequested = true;
        getWindow().getDecorView().post(this::scheduleSplashDismiss);
    }

    private void scheduleSplashDismiss() {
        if (!dismissRequested) {
            return;
        }

        if (splashOverlay == null) {
            dismissAttempts++;
            if (dismissAttempts > MAX_DISMISS_ATTEMPTS) {
                keepSplashOnScreen = false;
                return;
            }
            getWindow().getDecorView().postDelayed(this::scheduleSplashDismiss, 50);
            return;
        }

        if (dismissScheduled) {
            return;
        }

        dismissScheduled = true;
        long elapsed = System.currentTimeMillis() - splashStartTime;
        long delay = Math.max(0L, MIN_SPLASH_MS - elapsed);

        new Handler(Looper.getMainLooper()).postDelayed(this::fadeOutSplashOverlay, delay);
    }

    private void fadeOutSplashOverlay() {
        if (splashOverlay == null) {
            keepSplashOnScreen = false;
            return;
        }

        splashOverlay.animate()
            .alpha(0f)
            .setDuration(FADE_OUT_MS)
            .withEndAction(() -> {
                ViewGroup parent = (ViewGroup) splashOverlay.getParent();
                if (parent != null) {
                    parent.removeView(splashOverlay);
                }
                splashOverlay = null;
                keepSplashOnScreen = false;
            })
            .start();
    }

    @Override
    public void onResume() {
        super.onResume();
        if (dismissRequested) {
            scheduleSplashDismiss();
        }
    }
}
