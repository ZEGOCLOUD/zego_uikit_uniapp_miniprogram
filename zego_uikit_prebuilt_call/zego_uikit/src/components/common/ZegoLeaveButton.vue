<template>
    <button class="button" @tap="leaveRoom" hover-class="none">
        <image class="icon" :src="icon"></image>
    </button>
</template>
<script lang="ts" setup>
import { ref } from "vue";
import leaveIcon from "../../assets/icon_handup_normal.svg";
import { ZegoUIKit } from '../../index';
const props = defineProps<{
    onPressed?: () => void;
    onSucceed?: () => void;
}>();

const icon = ref(leaveIcon);
const leaveRoom = () => {
    if(typeof props.onPressed === 'function') {
        props.onPressed();
    }
    // @ts-ignore
    uni.showModal({
        title: "离开房间",
        content: "您确定要离开房间吗？",
        confirmText: "确认",
        cancelText: "取消",
        success: async (res: any)=> {
            if (res.confirm) {
                console.log('ZegoUIKit.getSignalingPlugin()', ZegoUIKit.getCurrentMode());
                // 呼叫邀请模式下，android 异常情况不执行
                if(ZegoUIKit.getCurrentMode() === 2 && !ZegoUIKit.getSignalingPlugin().zrtcRoomID) return;
                // 通知业务层
                if(typeof props.onSucceed === 'function') {
                    props.onSucceed();
                }
                await ZegoUIKit.logoutRoom();
            }
        },
        fail: () => {

        }
    })
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
    background: #E8543B;
}
.icon {
    width: 56rpx;
    height: 56rpx;
}
</style>