<template>
    <view class="inviter-page">
        <view class="inviter-state">正在呼叫...</view>
        <view class="user-list">
            <view class="user-box" v-for="user in invitees" :key="user.userID">
                <view class="default-avatar">
                    <!-- <image class="default-avatar" :src="`https://api.multiavatar.com/${user.userID}.svg?apikey=XqHm465NYsdLfb`"></image> -->
                    {{ user.userName?.substring(0, 1).toLocaleUpperCase() }}
                </view>
                <view class="name">{{ user.userName }}</view>
            </view>
        </view>
        <view class="btn-box">
            <ZegoCancelInvitationButton :invitees="invitees" :customData="customData" :onPressed="onCancelPressed"></ZegoCancelInvitationButton>
        </view>
    </view>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, getCurrentInstance } from 'vue';
import { ZegoUIKitPrebuiltCall, ZegoUIKitUser, ZegoCallInvitationRole, makePrebuiltListenerID, zploginfo } from "../index";
import ZegoCancelInvitationButton from '../../zego_uikit/src/components/invitation/ZegoCancelInvitationButton.vue';

const LISTENER_ID = makePrebuiltListenerID() // 生成回调ID
// const invitees = ref<ZegoUIKitUser[]>([]);
const customData = ref<string>("");
let isJoinRoom = false;
let proactivelyCancel = false; // 是否主动取消

const props = defineProps<{
    invitees: ZegoUIKitUser[],
}>();

onMounted(()=>{
    console.log('[Inviter Page]props', props.invitees);
    // 监听呼叫邀请相关事件
    ZegoUIKitPrebuiltCall.getSignalingPlugin().addCallInvitationListener(LISTENER_ID, {
        onCallInvitationAccepted: (callID, calleeID)=> {
            zploginfo('[interpage]onCallInvitationAccepted');
            isJoinRoom = true;
        },
    })
    // 监听uniapp事件
    // @ts-ignore
    // uni.onAppHide(()=>{
    //     zploginfo('[interpage]onAppHide');
    //     // 用户刷新小程序,退出zim（真机不生效）
    //     // PrebuiltCallCore.getInstance().unInit();
    // })
})

onUnmounted(()=>{
    zploginfo('[interpage]onUnmounted');
    if (!proactivelyCancel && !isJoinRoom && ZegoUIKitPrebuiltCall.getSignalingPlugin().zimCallID) {
        // 销毁时不是加入房间时，存在呼叫邀请，取消呼叫邀请
        const inviteesIDList = props.invitees.map((u)=> u.userID);
        const extendedData = JSON.stringify({ custom_data: customData.value })
        ZegoUIKitPrebuiltCall.getSignalingPlugin().cancelInvitation(inviteesIDList, extendedData);
    }
    ZegoUIKitPrebuiltCall.getSignalingPlugin().removeCallInvitationListener(LISTENER_ID); 
})

const onCancelPressed = (res: any) => {
    console.log('[inviterPage]oncancelpressed', res);
    proactivelyCancel = true;
    ZegoUIKitPrebuiltCall.onOutgoingCallCancelButtonPressed();
}
</script>
<style scoped>
.inviter-page {
    display: flex;
    flex-direction: column;
    padding: 60rpx 0 90rpx;
    box-sizing: border-box;
    background: #1C1F2E;
    width: 100vw;
    height: 100vh;
    font-family: PingFangSC-Regular;
}
.inviter-state{
    text-align: center;
    font-size: 36rpx;
    color: #fff;
}
.user-list {
    flex-grow: 1;
    display: flex;
    justify-content: space-around;
    align-items: center;
    padding: 0 70rpx;
}
.user-box{
    display: flex;
    flex-direction: column;
    align-items: center;
}
.default-avatar {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 140rpx;
    height: 140rpx;
	font-weight: 600;
	font-size: 32rpx;
	background-color: #3a3d4a;
	color: #FFFFFF;
	border-radius: 100%;
}
.avatar {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 140rpx;
    height: 140rpx;
    background: #333543;
    border-radius: 100%;
}
.default-avatar{
    color: #557BFF;
    line-height: 52rpx;
    font-size: 52rpx;
    font-weight: 600;
}
.name {
    text-align: center;
    margin-top: 18rpx;
    font-size: 30rpx;
    font-weight: 400;
    color: #fff;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 280rpx;
}
.btn-box {
    display: flex;
    justify-content: center;
}
</style>