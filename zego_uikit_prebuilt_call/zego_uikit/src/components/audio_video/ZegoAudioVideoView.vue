<template>
    <ZegoVideoFrame 
        :user="user" 
        :local="isLocal" 
        class="videoFrame"
        :pushBindaudiovolumenotify="pushBindaudiovolumenotify"
        :playerBindaudiovolumenotify="playerBindaudiovolumenotify"
    ></ZegoVideoFrame>
    <ZegoAudioFrame v-if="!user.isCameraOn" :user="user" class="audioFrame"></ZegoAudioFrame>
    <view class="state-box" :class="viewType">
        <image class="mic-icon" alt="Image" :src="soundIconSrc"></image>
        <view class="user-name">{{ user?.userName }}</view>
    </view>
</template>

<script lang="ts" setup>
import { ref, watch } from "vue";
import { ZegoUIKit, ZegoUIKitUser } from '../../index';

// 组件
import ZegoVideoFrame from './ZegoVideoFrame.vue';
import ZegoAudioFrame from './ZegoAudioFrame.vue';

import soundIcon from "../../assets/icon_sound_normal.svg";
import soundDisableIcon from "../../assets/icon_sound_disable.svg";
import soundPlayIcon from "../../assets/icon_mic_sound.svg";

const props = defineProps<{
    user: ZegoUIKitUser,
    viewType?: string,
}>();
let isLocal = ref<boolean>(false);
const soundIconSrc = ref(soundIcon);
watch(() => props.user, (newUser) => {
    console.warn('[ZegoAudioVideoView]watch user', newUser);
    isLocal = ref(ZegoUIKit.isLocalUser(props.user.userID));
    soundIconSrc.value = newUser?.isMicrophoneOn? soundIcon : soundDisableIcon;
},{ immediate: true, deep: true })

// live-push 音量监听
const pushBindaudiovolumenotify = (e: any) => {
    const volume = e.detail.volume;
    if (soundIconSrc.value !== soundDisableIcon) {
        if(volume >  10) {
            soundIconSrc.value = soundPlayIcon
        } else {
            soundIconSrc.value = soundIcon
        }
    }
    ZegoUIKit.updateAudioVolumeNotify(props.user?.streamConfig.streamID, e);
}

// live-player 音量监听
const playerBindaudiovolumenotify = (e: any) => {
    const volume = e.detail.volume
    if (soundIconSrc.value !== soundDisableIcon) {
        if(volume >  10) {
            soundIconSrc.value = soundPlayIcon
        } else {
            soundIconSrc.value = soundIcon
        }
    }
    ZegoUIKit.updateAudioVolumeNotify(props.user?.streamConfig.streamID, e);
}
</script>

<style scoped>
.videoFrame {
    display: flex;
    width: 100%;
    height: 100%;
    z-index: 1;
}
.audioFrame {
    display: flex;
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    z-index: 2;
}
.state-box {
    z-index: 2;
    position: absolute;
    bottom: 24rpx;
    right: 24rpx;
    display: flex;
    align-items: center;
    padding: 6rpx 12rpx;
    background: rgba(70,70,70,0.4);
    border-radius: 12rpx;
    color: rgba(255, 255, 255, 1);
    font-size: 24rpx;
}
.mic-icon { 
    width: 36rpx;
    height: 36rpx;
}
.user-name{
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 200rpx;
}
.small .state-box {
    bottom: 10rpx;
    right: 10rpx;
}
.small .user-name {
    max-width: 100rpx;
}
</style>