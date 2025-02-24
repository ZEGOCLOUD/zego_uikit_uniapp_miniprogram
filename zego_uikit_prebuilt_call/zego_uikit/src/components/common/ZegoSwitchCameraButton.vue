<template>
    <button class="button" @tap="switchCamera" hover-class="none">
        <image class="icon" :src="icon"></image>
    </button>
</template>
<script lang="ts" setup>
import { ref } from "vue";
import switchCameraIcon from "../../assets/icon_switch_camera.svg";
import { ZegoUIKit } from '../../index';
const icon = ref(switchCameraIcon);
let isClicked = false;
const switchCamera = () => {
    if(isClicked) return;
    isClicked = true;
    setTimeout(() => {
        isClicked = false;
    }, 500);
    ZegoUIKit.getLocalUser()?.streamConfig.pusherContext?.switchCamera({
        success: () => { 
            console.warn('switchCamera success!');
        },
        fail: () => {
            console.warn('switchCamera fail!');
        },
    });
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
