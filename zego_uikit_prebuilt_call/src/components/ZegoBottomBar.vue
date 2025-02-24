<template>
    <ZegoSwitchCameraButton/>
    <ZegoToggleCameraButton/>
    <ZegoToggleMicrophoneButton/>
    <ZegoLeaveButton :onSucceed="onSucceed" :onPressed="onPressed"/>
</template>
<script lang="ts" setup>
import ZegoSwitchCameraButton from '../../zego_uikit/src/components/common/ZegoSwitchCameraButton.vue';
import ZegoToggleCameraButton from '../../zego_uikit/src/components/common/ZegoToggleCameraButton.vue';
import ZegoToggleMicrophoneButton from '../../zego_uikit/src/components/common/ZegoToggleMicrophoneButton.vue';
import ZegoLeaveButton from '../../zego_uikit/src/components/common/ZegoLeaveButton.vue';
import { ZegoUIKitPrebuiltCall } from '../index';

const onSucceed = () => {
    ZegoUIKitPrebuiltCall.leaveRoom();
    if (ZegoUIKitPrebuiltCall.getConfig().mode === 2) {
        const inviteService = ZegoUIKitPrebuiltCall.getSignalingPlugin();
        // const localUser = ZegoUIKitPrebuiltCall.getLocalUser();
        // const localUserID = localUser?.userID;
        // const callUserID = inviteService.caller?.userID || ''
        // const selfCallUserID = '' // 自己主呼时，caller 不存在，而被呼时会存在具体用户

        // if (localUserID && callUserID === selfCallUserID) {
        console.log('[ZegoCallInvitationRoom]onCallEnded by self');
        ZegoUIKitPrebuiltCall.onCallEnded(inviteService.zimCallID, inviteService.zrtcRoomID);
        // }
    }
}

const onPressed = () => {
    // 点击了离开房间按钮
}
</script>

<style scoped>

</style>
