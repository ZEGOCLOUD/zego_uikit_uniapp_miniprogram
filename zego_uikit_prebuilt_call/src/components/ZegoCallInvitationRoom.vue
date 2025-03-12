<template>
    <view class="call">
        <PictureInPictureLayout class="pic-in-pic-layout" @tap="showButton"></PictureInPictureLayout>
        <ZegoBottomBar v-show="showBottomBar" class="button-container"
            :turnOnCameraWhenJoining="turnOnCameraWhenJoining"
            :turnOnMicrophoneWhenJoining="turnOnMicrophoneWhenJoining"></ZegoBottomBar>
    </view>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted, nextTick } from "vue";
import { ZegoUIKitPrebuiltCall, ZegoUIKitUser, ZegoCallInvitationRole, makePrebuiltListenerID } from "../index";
// 引入uikit组件
import PictureInPictureLayout from '../../zego_uikit/src/components/audio_video_contanier/PictureInPictureLayout.vue';

// 引入 prebuilt 组件
import ZegoBottomBar from './ZegoBottomBar.vue';

const turnOnCameraWhenJoining = ref(ZegoUIKitPrebuiltCall.getConfig().turnOnCameraWhenJoining ?? false);
const turnOnMicrophoneWhenJoining = ref(ZegoUIKitPrebuiltCall.getConfig().turnOnMicrophoneWhenJoining ?? false);
const LISTENER_ID = makePrebuiltListenerID() // 生成回调ID
let lastestUserList: ZegoUIKitUser[] = [];
let leaveRoomTimer: any = null;

onMounted(() => {
    nextTick(() => authCheck());
    ZegoUIKitPrebuiltCall.addUIKitListener(LISTENER_ID, {
        onUserLeaved: (user) => {
            const localUser = ZegoUIKitPrebuiltCall.getLocalUser()
            const localUserID = localUser?.userID
            const inviteService = ZegoUIKitPrebuiltCall.getSignalingPlugin()
            console.log('[ZegoCallInvitationRoom]onUserLeaved', user);
             // 1v1时，对端退房，本端需要退房
            if (user.userID !== localUserID) {
                // 需要在调用之前拿到数据
                // const callUserID = inviteService.caller?.userID || ''
                // const selfCallUserID = '' // 自己主呼时，caller 不存在，而被呼时会存在具体用户
                const callID = inviteService.zimCallID
                const roomID = inviteService.zrtcRoomID

                ZegoUIKitPrebuiltCall.leaveRoom();
                ZegoUIKitPrebuiltCall.logoutRoom();

                // if(localUserID && callUserID === selfCallUserID) {
                if (ZegoUIKitPrebuiltCall.getConfig().mode === 2) {
                    console.log('[ZegoCallInvitationRoom] onCallEnded by user:', user);
                    ZegoUIKitPrebuiltCall.onCallEnded(callID, roomID);
                }
                // }
                
            }
        },
        onUserListUpdated: (userList) => {
            console.log('[ZegoCallInvitationRoom]onUserListUpdated', userList);
            lastestUserList = userList;
        }
    })
    // bindUniEvents();
})
onUnmounted(() => {
    console.warn('[ZegoCallInvitationRoom]onUnmounted');
    clearTimeout(hideTimer);
    clearTimeout(leaveRoomTimer);
    ZegoUIKitPrebuiltCall.removeUIKitListener(LISTENER_ID);
    // removeUniEvents();
})

const authCheck = async () => {
    // 检测设备权限, 里面会弹窗
    const hardCheck = await ZegoUIKitPrebuiltCall.authCheck();
    if (!hardCheck) {
        return
    }
    // 被邀请者进房后仅自己在房间时退出房间
    // if (ZegoUIKitPrebuiltCall.getCurrentRole() === ZegoCallInvitationRole.invitee) {
    leaveRoomTimer = setTimeout(() => {
        console.log('lastestUserID', lastestUserList.map(user => user.userID).join('、'))
        if(lastestUserList.length <= 1) {
            console.log('[ZegoCallInvitationRoom]主动退出', lastestUserList);
            ZegoUIKitPrebuiltCall.leaveRoom();
            ZegoUIKitPrebuiltCall.logoutRoom();
        }
    }, 3000);
    // }
}

// 按钮隐藏
const showBottomBar = ref(true);
let hideTimer = setTimeout(() => {
    showBottomBar.value = false
}, 5000);

function showButton() {
    console.log('[ZegoCallInvitationRoom]show bottom bar', showBottomBar.value);
    // 点击切换显示隐藏，显示时5秒后隐藏
    showBottomBar.value = !showBottomBar.value;
    clearTimeout(hideTimer);
    if (showBottomBar.value === true) {
        hideTimer = setTimeout(()=>{
            showBottomBar.value = false
        }, 5000);
    }
}

// 监听 uni 事件
const bindUniEvents = () => {
    // @ts-ignore
    uni.onAppHide(()=>{
        console.warn('call hide');
    })

    // @ts-ignore
    uni.onError((err) => {
        console.warn(`single call err, err: ${err}` );
    })

    // @ts-ignore
    uni.onNetworkStatusChange(res => {
        console.warn('onNetworkStatusChange', res);
        // if (res.isConnected && connectType === ConnectType.CONNECTED) {
            // zlogwarning('onNetworkStatusChange: roomID=', res)
            // FIXME this.reLogin();
            // android 断网重连拉流端会卡住，重新播放
            // player.value?.playerContext.play();
        // }
    })
}
const removeUniEvents = () => {
    // @ts-ignore
    uni.offNetworkStatusChange();
}
</script>
<style scoped>
.call {
    display: flex;
    flex-direction: column;
    width: 100vw;
    height: 100vh;
    overflow: hidden;
}
.pic-in-pic-layout {
    width: 100%;
    height: 100%;
}

/* 按钮容器样式 */
.button-container {
    position: fixed;
    bottom: 0;
    display: flex;
    justify-content: space-evenly;
    align-items: center;
    width: 100%;
    height: 122rpx;
    /* 水平居中按钮 */
    margin-top: auto;
    background:rgba(28, 31, 46, 1);
    border-top: 1rpx solid rgba(61, 64, 84, 1);
    z-index: 3;
}
</style>
