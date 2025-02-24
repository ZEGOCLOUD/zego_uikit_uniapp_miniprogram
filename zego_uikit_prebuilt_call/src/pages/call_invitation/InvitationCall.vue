<template>
    <view class="invitation-call">
        <ZegoCallInvitationRoom v-if="isRoomShow"></ZegoCallInvitationRoom>
        <ZegoCallInviter v-if="isWaiting" :invitees="invitees"></ZegoCallInviter>
        <ZegoCallInvitee v-if="isReceived" :callID="propsCallID" :caller="propsCaller"></ZegoCallInvitee>
    </view>
</template>
<script lang="ts" setup>
import { ref, onMounted, onUnmounted, getCurrentInstance} from "vue";
import { ZegoUIKitPrebuiltCall, ZegoUIKitUser, zploginfo, makePrebuiltListenerID, convertToCamelCase, ZegoCallInvitationRole } from "../../index";
import ZegoCallInvitationRoom from "../../components/ZegoCallInvitationRoom.vue";
import ZegoCallInviter from "../../components/ZegoCallInviter.vue";
import ZegoCallInvitee from "../../components/ZegoCallInvitee.vue";

let isWaiting = ref(false);
let isRoomShow = ref(false);
let isReceived = ref(false);
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
            zploginfo('[invitationCall]onCallInvitationAccepted');
            if (hasGlobalPagePath) {
                ZegoUIKitPrebuiltCall.navigateBack();
            }
            isWaiting.value = false;
            isReceived.value = false;
        },
        onCallInvitationReceived: (callID, extendedData) => {
            const extendedDataJson = JSON.parse(extendedData);
            const callData = JSON.parse(extendedDataJson.data);
            propsCallID.value = callID;
            propsCaller.value = { userID: callData.inviter.id, userName: callData.inviter.name }
            isReceived.value = true
        }
    })
})

onUnmounted(() => {
	console.warn('[invitationCall]unmounted', ZegoUIKitPrebuiltCall.getSignalingPlugin().zrtcRoomID);
    if(ZegoUIKitPrebuiltCall.getSignalingPlugin().zrtcRoomID){
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
</style>