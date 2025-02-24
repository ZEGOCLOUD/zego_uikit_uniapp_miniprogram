<template>
    <ZegoImageButton 
        :image="imageSource" 
        :width="130" 
        :height="130"
        :borderRadius="100"
        :onPress="cancel" 
        :backgroundColor="backgroundColor"
        :iconWidth="80"
        :iconHeight="80"
    ></ZegoImageButton>
</template>
<script lang="ts" setup>
import { ref } from "vue";
import { ZegoUIKit, ZegoUIKitUser } from "../../index";
import cancelImg from '../../assets/button_call_reject.png';
import ZegoImageButton from '../common/ZegoImageButton.vue';

const props = defineProps<{
    imageSrc?: string;
    invitees: ZegoUIKitUser[];
    customData?: string;
    // text?: string;
    onPressed?: ({}?) => void;
}>();
const imageSource = ref(props.imageSrc ?? cancelImg);
const backgroundColor = ref("#FF4A50");

const cancel = () => {
    const { onPressed, invitees } = props;
    const inviteesIDList = invitees.map((u)=> u.userID);
    const extendedData = JSON.stringify({custom_data: props.customData})
    ZegoUIKit.getSignalingPlugin().cancelInvitation(inviteesIDList, extendedData).then((res: any)=> {
        if (typeof onPressed === 'function') {
            onPressed({code: 0});
        }
    })
    .catch((err: any)=>{
        if (typeof onPressed === 'function') {
            onPressed({
                code: err.code,
                message: err.message
            });
        }
    });
   
}
</script>
