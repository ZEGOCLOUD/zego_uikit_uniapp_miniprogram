<template>
    <view class="big-view" v-if="bigViewUser">
        <ZegoAudioVideoView :user="bigViewUser" viewType="big" class="audio-video-view"></ZegoAudioVideoView>
    </view>
    <view class="small-view" v-if="smallViewUser">
        <ZegoAudioVideoView :user="smallViewUser" viewType="small" class="audio-video-view" ></ZegoAudioVideoView>
    </view>
</template>
<script lang="ts" setup>
import { onMounted, computed, ref, onUnmounted } from 'vue';
import ZegoAudioVideoView from '../audio_video/ZegoAudioVideoView.vue';
import { ZegoUIKit, ZegoUIKitUser, makeListenerID } from '../../index';

const globalAudioVideoUserList = ref<ZegoUIKitUser[]>([]);

const smallViewUser = computed(()=>{
    const streamUserList = globalAudioVideoUserList.value.filter((u)=>u.streamConfig);
    if (streamUserList.length > 1) {
        // 人数大于1时，smallView 为 localUser
        const user = ZegoUIKit.getLocalUser();
        const smallViewUser = { ...globalAudioVideoUserList.value.filter((u)=>u.userID === user?.userID)[0]};
        console.warn('[PictureInPictureLayout]smallViewUser', smallViewUser);
        return smallViewUser;
    }
});
const bigViewUser = computed(()=>{
    const streamUserList = globalAudioVideoUserList.value.filter((u)=>u.streamConfig);
    const user = ZegoUIKit.getLocalUser();
    if (user) {
        if (streamUserList.length > 1) {
            const bigViewUser = { ...globalAudioVideoUserList.value.filter((u)=>u.userID !== user?.userID)[0] };
            console.warn('[PictureInPictureLayout]bigView显示对端画面', bigViewUser);
            return bigViewUser;
        } else {
            console.warn('[PictureInPictureLayout]bigView显示本端画面', globalAudioVideoUserList.value);
            const bigViewUser = { ...globalAudioVideoUserList.value.filter((u)=>u.userID === user?.userID)[0]};
            return bigViewUser;
        }
    } else {
        return null;
    }
});
const LISTENER_ID = makeListenerID() // 生成回调ID
onMounted(()=>{
    ZegoUIKit.addUIKitListener(LISTENER_ID, {
        onUserListUpdated: (userList) => {
            console.log('[PictureInPictureLayout]onUserListUpdated', userList);
            globalAudioVideoUserList.value = [...userList];
        }
    })
})
onUnmounted(()=> {
    ZegoUIKit.removeUIKitListener(LISTENER_ID);
})
</script>


<style scoped>
.big-view {
    display: flex;
    width: 100%;
    height: 100%;
    background-color: #666;
    z-index: 1; /* 确保它低于按钮的层级 */
}
.small-view {
    position: absolute;
    top: 45rpx;
    right: 12rpx;
    width: 190rpx;
    height: 338rpx;
    border: 1rpx solid #A4A4A4;
    border-radius: 18rpx;
    /* 假设背景色为深灰色 */
    background-color: #333; 
    /* 确保远程视频在按钮上方 */
    z-index: 10;
    overflow: hidden;
}
.small-view  .user-name {
    max-width: 80rpx;
}
.audio-video-view {
    display: flex;
    width: 100%;
    height: 100%;
}
</style>