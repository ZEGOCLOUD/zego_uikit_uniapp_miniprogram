<template>
    <button class="button" @tap="toggleMicrophone" hover-class="none">
        <image class="icon" :src="icon"></image>
    </button>
</template>
<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from "vue";
import micIcon from "../../assets/icon_mic_normal.svg";
import micDisableIcon from "../../assets/icon_mic_disable.svg";
import { ZegoUIKit, ZegoUIKitUser, makeListenerID } from '../../index';
const props = defineProps<{
    iconCameraOn?: string;
    iconCameraOff?: string;
    isOn?: boolean;
    onPress?: () => void;
}>();

const icon = ref(micIcon);
const LISTENER_ID = makeListenerID() // 生成回调ID
let isClicked = false;
onMounted(()=>{
    ZegoUIKit.addUIKitListener(LISTENER_ID, {
        onLocalUserUpdated: (user) => {
            console.log('[ZegoToggleMicrophoneButton]LocalUserUpdated', user);
            icon.value = user?.isMicrophoneOn? micIcon : micDisableIcon;
        }
    })
})
onUnmounted(()=> {
    ZegoUIKit.removeUIKitListener(LISTENER_ID);
})

const toggleMicrophone = () => {
    if(isClicked) return;
    isClicked = true;
    setTimeout(() => {
        isClicked = false;
    }, 500);
    const user = ZegoUIKit.getLocalUser();
    console.warn('[ZegoToggleMicrophoneButton]toggleMicrophone user', user);
    user && (user.isMicrophoneOn = !user?.isMicrophoneOn);
    icon.value = user?.isMicrophoneOn? micIcon : micDisableIcon;
    ZegoUIKit.updateUser(user as ZegoUIKitUser);
    // 这里设置流附加消息去修改状态
    const extraInfo: string = JSON.stringify({
        isCameraOn: user?.isCameraOn,
        isMicrophoneOn: user?.isMicrophoneOn,
        hasVideo: true,
        hasAudio: true,
    });
    ZegoUIKit.setStreamExtraInfo(user?.streamConfig.streamID as string, extraInfo);
}
</script>
<style scoped>
.button {
    display: flex;
    padding: 10rpx;
    width: 76rpx;
    height: 76rpx;
    border: none;
    outline: none;
    border-radius: 18rpx;
    background: #313443;
}
.icon {
    width: 56rpx;
    height: 56rpx;
}
</style>