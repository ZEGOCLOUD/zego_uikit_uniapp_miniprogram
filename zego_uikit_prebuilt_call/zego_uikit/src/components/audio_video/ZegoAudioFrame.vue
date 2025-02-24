<template>
    <view class="zego-audio-frame">
       <view class="default-avatar" v-if="props.user">
            {{ user?.userName?.substring(0, 1).toLocaleUpperCase() }}
            <!-- <image class="default-avatar" :src="defaultAvatar"></image> -->
       </view>
    </view>
</template>

<script lang="ts" setup>
import { onMounted, ref, watch } from 'vue';
import { ZegoUIKitUser } from '../../index';
import defaultAvatarSvg from '../../assets/icon_default_avatar.svg';

const props = defineProps<{
    user?: ZegoUIKitUser,
}>();
let defaultAvatar = ref(defaultAvatarSvg);
onMounted(()=>{
})
watch(() => props.user, (newUser) => {
    console.warn('[ZegoAudioFrame]watch user', newUser);
    defaultAvatar.value = newUser?.avatar ?? (newUser?.userID ? `https://api.multiavatar.com/${newUser?.userID}.svg?apikey=XqHm465NYsdLfb` : defaultAvatarSvg);
},{ immediate: true, deep: true })
</script>

<style scoped>
.zego-audio-frame {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #171821;
}

.avatar {
    
}

.default-avatar {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 160rpx;
    height: 160rpx;
    font-weight: 600;
	font-size: 32rpx;
	background-color: #3a3d4a;
	color: #FFFFFF;
	border-radius: 100%;
}
</style>