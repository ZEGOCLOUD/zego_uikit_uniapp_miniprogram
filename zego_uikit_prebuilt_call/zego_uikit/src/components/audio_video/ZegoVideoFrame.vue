<template>
    <view class="zego-video-frame">
        <!-- 推流 -->
        <live-pusher v-if="local && user?.streamConfig" :url="user?.streamConfig.url" :mode="user?.streamConfig.mode"
            :autopush="true" :enable-camera="user?.isCameraOn" :enable-mic="user?.isMicrophoneOn"
            :min-bitrate="user?.streamConfig.minBitrate" :max-bitrate="user?.streamConfig.maxBitrate" :aspect="user?.streamConfig.videoAspect"
            remote-mirror="true" :local-mirror="user?.streamConfig.localMirror"
            :audio-volume-type="user?.streamConfig.audioVolumeType"
            :fps="user?.streamConfig.fps"
            enable-ans="true" auto-focus="false"
            @statechange="onPushStateChange"
            @netstatus="onPushNetStateChange" @audiovolumenotify="pushBindaudiovolumenotify"
        />
        <!-- 拉流 -->
        <live-player v-if="!local && user?.streamConfig && online" :src="user?.streamConfig.url"
            :autoplay="true" :mode="user?.streamConfig.mode" :mute-audio="user?.streamConfig.muteAudio"
            :mute-video="user?.streamConfig.muteVideo" :object-fit="user?.streamConfig.objectFit"
            :min-cache="0.2" :max-cache="0.8" :sound-mode="user?.streamConfig.soundMode"
            auto-pause-if-navigate="true" auto-pause-if-open-native="true"
            @statechange="onPlayStateChange" @netstatus="onPlayNetStateChange" @audiovolumenotify="playerBindaudiovolumenotify"
        />
    </view>
</template>

<script lang="ts" setup>
import { onMounted, onUnmounted, ref } from 'vue';
import { ZegoUIKit, ZegoUIKitUser, makeListenerID } from '../../index';

const props = defineProps<{
    user?: ZegoUIKitUser,
    local: boolean,
    pushBindaudiovolumenotify?: (e: any)=> void,
    playerBindaudiovolumenotify?: (e: any)=> void,
}>();
// 小程序 player 播放状态
let online = ref(true);
const LISTENER_ID = makeListenerID() // 生成回调ID
onMounted(()=>{
    ZegoUIKit.addUIKitListener(LISTENER_ID, {
        onReconnected: () => {
            if(!props.local) {
                online.value = true;
            }
        }
    })
})
onUnmounted(()=> {
    ZegoUIKit.removeUIKitListener(LISTENER_ID);
})

//live-pusher 绑定推流事件，透传推流事件给 SDK
const onPushStateChange = (e: any) => {
    ZegoUIKit.updatePlayerState(props.user?.streamConfig.streamID as string, e);
}
// live-pusher 绑定网络状态事件，透传网络状态事件给 SDK
const onPushNetStateChange = (e: any) => {
    // console.log('pusher net state', e);
    ZegoUIKit.updatePlayerNetStatus(props.user?.streamConfig.streamID as string, e);
}

//live-player 绑定拉流事件，透传拉流事件给 SDK
const onPlayStateChange = (e: any) => { 
    // console.log('player state', e);
    if(e.detail.code === -2301) {
        // 收到小程序 code 码 -2301时，需自行重启拉流
        online.value = false;
    }
    ZegoUIKit.updatePlayerState(props.user?.streamConfig.streamID, e)
}
// live-player 绑定网络状态事件，透传网络状态事件给 SDK
const onPlayNetStateChange = (e: any) => {
    // console.log('player net state', e);
    ZegoUIKit.updatePlayerNetStatus(props.user?.streamConfig.streamID, e)
}
</script>

<style scoped>
.zego-video-frame {
    width: 100%;
    height: 100%;
}

live-pusher,
live-player {
    width: 100%;
    height: 100%;
}
</style>
