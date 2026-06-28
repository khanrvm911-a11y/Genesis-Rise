package com.genesis.app;

import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "GenesisLaunch")
public class GenesisLaunchPlugin extends Plugin {

    @PluginMethod
    public void dismissSplash(PluginCall call) {
        if (getActivity() instanceof MainActivity) {
            ((MainActivity) getActivity()).hideSplashOverlay();
        }
        call.resolve();
    }
}
