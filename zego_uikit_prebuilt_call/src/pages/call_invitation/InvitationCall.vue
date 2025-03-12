<template>
    <view class="invitation-call">
        <ZegoCallInvitationRoom v-if="isRoomShow"></ZegoCallInvitationRoom>
        <ZegoCallInviter v-if="isWaiting" :invitees="invitees"></ZegoCallInviter>
        <ZegoCallInvitee v-if="isReceived" :callID="propsCallID" :caller="propsCaller"></ZegoCallInvitee>
        <div class="reconnect" v-if="isReconecting">
            <image class="loading" :src="lodingIcon"></image>
            <div class="content">正在尝试重连...</div>
        </div>
    </view>
</template>
<script lang="ts" setup>
import { ref, onMounted, onUnmounted, getCurrentInstance} from "vue";
import { ZegoUIKitPrebuiltCall, ZegoUIKitUser, zploginfo, makePrebuiltListenerID, convertToCamelCase, ZegoCallInvitationRole } from "../../index";
import ZegoCallInvitationRoom from "../../components/ZegoCallInvitationRoom.vue";
import ZegoCallInviter from "../../components/ZegoCallInviter.vue";
import ZegoCallInvitee from "../../components/ZegoCallInvitee.vue";
import lodingIcon from "../../assets/reconnect_loading@2x.png";

let isWaiting = ref(false);
let isRoomShow = ref(false);
let isReceived = ref(false);
let isReconecting = ref(false);
let invitees = ref([]);
let propsCallID = ref("");
let propsCaller = ref<ZegoUIKitUser>();
let hasGlobalPagePath = false;
const LISTENER_ID = makePrebuiltListenerID() // 生成回调ID

onMounted(() => {
    zploginfo('[invitationCall]onMounted', getCurrentInstance());
    const instance = getCurrentInstance()?.proxy;
    //@ts-ignore
    const eventChannel = instance?.getOpenerEventChannel();
    zploginfo('===eventChannel', eventChannel);
    if (eventChannel) {
        eventChannel.on('dataFromCallInvitation', function(data: any) {
            console.log('dataFromCallInvitation', data);
            hasGlobalPagePath = true;
            if (data.invitees) {
                invitees.value = convertToCamelCase(data.invitees);
                isWaiting.value = true;
            }
            if (data.caller) {
                propsCallID.value = data.callID;
                propsCaller.value = data.caller;
                isReceived.value = true;
            }
        })
    }

    // 监听 prebuilt 层的事件
    ZegoUIKitPrebuiltCall.addPrebuiltListener(LISTENER_ID, {
        onLeaveRoom: () => {
            zploginfo('[invitationCall]onLeaveRoom');
            isRoomShow.value = false;
            if (hasGlobalPagePath) {
                ZegoUIKitPrebuiltCall.navigateBack();
            }
        },
    })
    // 监听呼叫邀请相关事件
    ZegoUIKitPrebuiltCall.getSignalingPlugin().addCallInvitationListener(LISTENER_ID, {
		onCallInvitationCreated: (callID, extendedData) => {
			zploginfo('[invitationCall]onCallInvitationCreated', extendedData);
            const extendedDataJson = JSON.parse(extendedData);
            const callData = JSON.parse(extendedDataJson.data);
            invitees.value = convertToCamelCase(callData.invitees);
			// 显示呼叫等待页组件
			isWaiting.value = true;
		},
        onCallInvitationCancelled: ()=> {
            zploginfo('[invitationCall]onCallInvitationCancelled');
            if (hasGlobalPagePath) {
                ZegoUIKitPrebuiltCall.navigateBack();
            }
            isWaiting.value = false;
            isReceived.value = false;
        },
        onCallInvitationAccepted: (callID, calleeID)=> {
            zploginfo('[invitationCall]onCallInvitationAccepted');
            isWaiting.value = false;
            isReceived.value = false;
            isRoomShow.value = true;
        },
        onCallInvitationRefused: () => {
            zploginfo('[invitationCall]onCallInvitationRefused');
            if (hasGlobalPagePath) {
                ZegoUIKitPrebuiltCall.navigateBack();
            }
            isWaiting.value = false;
            isReceived.value = false;
        },
        onCallInvitationReceived: (callID, extendedData) => {
            zploginfo('[invitationCall]onCallInvitationReceived', callID, extendedData);
            const extendedDataJson = JSON.parse(extendedData);
            const callData = JSON.parse(extendedDataJson.data);
            propsCallID.value = callID;
            propsCaller.value = { userID: callData.inviter.id, userName: callData.inviter.name };
            isReceived.value = true;
            isRoomShow.value = false;
        },
        onCallInvitationTimeoutofInviter: (callID) => {
            zploginfo('[invitationCall]onCallInvitationTimeoutofInviter', callID);
            isWaiting.value = false;
            isReceived.value = false;
        },
        onCallInvitationTimeoutofInvitee: (callID, caller) => {
            zploginfo('[invitationCall]onCallInvitationTimeoutofInvitee', callID, caller);
            isWaiting.value = false;
            isReceived.value = false;
        },
        onZIMConnectionStateChanged: (state) => {
            zploginfo('[invitationCall]onZIMConnectionStateChanged', state);
            if (state === 3) {
                isReconecting.value = true;
            } else {
                isReconecting.value = false;
            }
        },
    })
})

onUnmounted(() => {
	console.warn('[invitationCall]unmounted', ZegoUIKitPrebuiltCall.getSignalingPlugin().zrtcRoomID);
    if(isRoomShow.value){
        // 存在房间id
        ZegoUIKitPrebuiltCall.leaveRoom();
        ZegoUIKitPrebuiltCall.logoutRoom();
    }
    ZegoUIKitPrebuiltCall.removePrebuiltListener(LISTENER_ID);
    ZegoUIKitPrebuiltCall.getSignalingPlugin().removeCallInvitationListener(LISTENER_ID); 
	// ZegoUIKitPrebuiltCall.unInit();
})
</script>
<style scoped>
.invitation-call {
    display: flex;
    flex-direction: column;
    /* width: 100vw;
    height: 100vh; */
    overflow: hidden;
}
.reconnect {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 103;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background: rgba(42, 42, 42, 0.6);
}
.loading {
    box-sizing: border-box;
    width: 40px;
    height: 40px;
    background-size: contain;
    -webkit-animation: myRotate 1s linear infinite;
    animation: myRotate 1s linear infinite; /*Safari and Chrome*/
}
.content {
    margin-top: 6px;
    color: #ffffff;
    font-weight: 600;
    font-size: 16px;
}

@keyframes myRotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

</style>