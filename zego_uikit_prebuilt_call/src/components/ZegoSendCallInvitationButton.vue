<template>
    <ZegoStartInvitationButton 
        :type="type" 
        :invitees="props.invitees" 
        :icon="props.icon"
        :text="props.text"
        :timeout="props.timeout"
        :customData="props.customData"
        :onPressed="onPress"
    >
        <!-- <slot></slot> -->
    </ZegoStartInvitationButton>
</template>
<script lang="ts" setup>
import { onMounted } from 'vue';
import ZegoStartInvitationButton from '../../zego_uikit/src/components/invitation/ZegoStartInvitationButton.vue';
import { ZegoUIKitPrebuiltCall, ZegoUIKitUser, ZegoCallInvitationType } from '../index';
const props = defineProps<{
    isVideoCall: boolean;
    invitees: ZegoUIKitUser[];
    icon?: string;
    text?: string;
    timeout?: number;
    customData?: string;
    onPressed?: (code: number, message: string, errorInvitees: string[]) => void;
}>();

const onPress = (res: any) => {
    console.log('[ZegoSendCallInvitationButton]send onpress', res, props.invitees);
    if (res.code === 0) {
        ZegoUIKitPrebuiltCall.onInvitationSent(res.type, res.invitees, res.customData);
    }
    if (typeof props.onPressed === 'function') {
        props.onPressed(res.code, res.message, res.errorUserLIst);
    }
};

const type = props.isVideoCall ? ZegoCallInvitationType.videoCall : ZegoCallInvitationType.voiceCall;
onMounted(() => {
    console.warn('[ZegoSendCallInvitationButton]onmounted', props);
})
</script>