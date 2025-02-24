<template>
    <ZegoImageButton 
        :image="imageSource" 
        :width="130" 
        :height="130"
        :borderRadius="100"
        :backgroundColor="backgroundColor"
        :iconWidth="80"
        :iconHeight="80"
        :onPress="accept"
    ></ZegoImageButton>
</template>
<script lang="ts" setup>
import { ref } from "vue";
import { ZegoUIKit } from "../../index";
import acceptImg from '../../assets/button_call_audio_accept.png';
import ZegoImageButton from '../common/ZegoImageButton.vue';

const props = defineProps<{
    callID?: string;
    data?: string;
    imageSrc?: string;
    text?: string;
    onPressed?: ({}?) => void;
}>();
const backgroundColor = ref('#30D059');
const imageSource = ref(props.imageSrc ?? acceptImg);

const accept = () => {
    const { onPressed } = props;
    ZegoUIKit.getSignalingPlugin().acceptInvitation(props.callID!, props.data!)
        .then((res: any)=>{
            console.log('[ZegoAcceptInvitationButton] accept success', res);
            if (typeof onPressed === 'function') {
                onPressed({
                    code: 0,
                    callID: res.callID
                });
            }
        })
        .catch((err: any)=>{
            console.log('[ZegoAcceptInvitationButton] accept error', err);
            if (typeof onPressed === 'function') {
                onPressed({ 
                    code: err.code,
                    message: err.message,
                });
            }
        })
}
</script>
