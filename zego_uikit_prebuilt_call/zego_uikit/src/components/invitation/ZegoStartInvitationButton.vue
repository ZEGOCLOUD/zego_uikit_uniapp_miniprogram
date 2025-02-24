<template>
    <view @click="send">
        <slot>
            {{ props.text || '开始' }}
        </slot>
    </view>
</template>
<script lang="ts" setup>
import { ZegoUIKit, ZegoUIKitUser } from "../../index";

const props = defineProps<{
    invitees: ZegoUIKitUser[];
    data?: string;
    icon?: string;
    text?: string;
    type?: number;
    timeout?: number;
    customData?: string;
    onPressed?: ({callID, invitees, timeout, errorUserLIst, customData, message}: any) => void;
}>();
let isClicked = false;
console.warn(`[ZegoStartInvitationButton]`, props);
const send = () => {
    console.warn(`[ZegoStartInvitationButton] send()`);
    if (isClicked) return;
    if (!ZegoUIKit.getSignalingPlugin()) {
        console.log('还未初始化 UIKit！');
        return;
    }
    isClicked = true;
    setTimeout(() => {
        isClicked = false;
    }, 500);
    const {invitees, type, timeout, customData, onPressed} = props;
    ZegoUIKit.getSignalingPlugin().sendInvitation(invitees, type as number, customData as string, timeout as number)
        .then(({ callID, timeout, errorUserLIst, customData }: any)=>{
            console.log('===start sendInvitation success');
            if (typeof onPressed === 'function') {
                onPressed({ 
                    code: 0, 
                    callID,
                    invitees, 
                    type,
                    timeout,
                    errorUserLIst,
                    customData
                });
            }
        })
        .catch((err)=>{
            console.log('===start sendInvitation err', err);
            if (typeof onPressed === 'function') {
                onPressed({ 
                    code: err.code,
                    message: err.message,
                    errorUserLIst: props.invitees 
                });
            }
        });
   
}
</script>
