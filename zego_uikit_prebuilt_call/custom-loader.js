module.exports = function(source) {
    const modifiedSource = source.replace(/\/zego_uikit_prebuilt_call/g, '/ZegoUIKitPrebuiltCall');
    this.callback(null, modifiedSource);
};