<template>
    <ZegoImageButton 
        :image="imageSource" 
        :width="130" 
        :height="130"
        :borderRadius="100"
        :backgroundColor="backgroundColor"
        :iconWidth="80"
        :iconHeight="80"
        :onPress="refuse"
    ></ZegoImageButton>
</template>
<script lang="ts" setup>
import { ref } from "vue";
import { ZegoUIKit } from "../../index";
import refuseImg from '../../assets/button_call_reject.png';
import ZegoImageButton from '../common/ZegoImageButton.vue';

const props = defineProps<{
    callID?: string;
    data?: string;
    imageSrc?: string;
    text?: string;
    onPressed?: ({}?) => void;
}>();

const backgroundColor = ref('#FF4A50');
const imageSource = ref(props.imageSrc ?? refuseImg);
console.warn(`[ZegoRefuseInvitationButton]`, props);
const refuse = () => {
    const { onPressed } = props;
    ZegoUIKit.getSignalingPlugin().refuseInvitation()
        .then((res)=>{
            console.log('[ZegoRefuseInvitationButton]refuse sucess', res);
            if (typeof onPressed === 'function') {
                onPressed({
                    code: 0,
                    // callID: res.callID
                });
            }
        })
        .catch((err)=>{
            console.log('[ZegoRefuseInvitationButton]refuse error', err);
            if (typeof onPressed === 'function') {
                onPressed({ 
                    code: err.code,
                    message: err.message,
                });
            }
        })
}
</script>
