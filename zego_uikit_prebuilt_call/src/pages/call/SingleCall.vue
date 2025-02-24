<template>
    <view class="single-call">
        <PictureInPictureLayout class="pic-in-pic-layout" @tap="showButton"></PictureInPictureLayout>
        <ZegoBottomBar v-show="showBottomBar" class="button-container"
            :turnOnCameraWhenJoining="turnOnCameraWhenJoining"
            :turnOnMicrophoneWhenJoining="turnOnMicrophoneWhenJoining"></ZegoBottomBar>
        <!-- 弹出窗口的容器 -->
        <!-- <view v-if="showMoreMenu" class="more-menu-container">
            <button v-if="showCamera" hover-class="none" class="action-button">
                <image class="icon" :src="cameraIconSrc"></image>
            </button>
            <button v-if="showMicrophone" hover-class="none" class="action-button">
                <image class="icon" :src="micIconSrc"></image>
            </button>
        </view> -->
    </view>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted, nextTick, getCurrentInstance } from "vue";
import { ZegoUIKitPrebuiltCall, ZegoUIKitPrebuiltCallConfig, makePrebuiltListenerID, zploginfo } from '../../index';
// 引入uikit组件
import PictureInPictureLayout from '../../../zego_uikit/src/components/audio_video_contanier/PictureInPictureLayout.vue';

// 引入 prebuilt 组件
import ZegoBottomBar from '../../components/ZegoBottomBar.vue';

// const props = defineProps<{
//     config: any,
// }>();
const turnOnCameraWhenJoining = ref(ZegoUIKitPrebuiltCall.getConfig().turnOnCameraWhenJoining ?? false);
const turnOnMicrophoneWhenJoining = ref(ZegoUIKitPrebuiltCall.getConfig().turnOnMicrophoneWhenJoining ?? false);
const LISTENER_ID = makePrebuiltListenerID() // 生成回调ID
let hasGlobalPagePath = false;
// let config = ref<ZegoUIKitPrebuiltCallConfig>({});

const joinRoom = async () => {
    // 检测设备权限, 里面会弹窗
    const hardCheck = await ZegoUIKitPrebuiltCall.authCheck();
    if (!hardCheck) {
        return
    }
}

onMounted(() => {
    // 确保页面已经初始化完成
    console.warn('single call mounted');
    const instance = getCurrentInstance()?.proxy;
    //@ts-ignore
    const eventChannel = instance?.getOpenerEventChannel();
    zploginfo('===eventChannel', eventChannel);
    if (eventChannel) {
        eventChannel.on('dataFromCall', function(data: any) {
            console.log('dataFromCall', data);
            hasGlobalPagePath = true;
            // if (data.config) {
            //   config.value = data.confg;
            // }
        })
    }
    // 监听 prebuilt 层的事件
    ZegoUIKitPrebuiltCall.addPrebuiltListener(LISTENER_ID, {
        onLeaveRoom: () => {
            zploginfo('[SingleCall]onLeaveRoom');
            if (hasGlobalPagePath) {
                ZegoUIKitPrebuiltCall.navigateBack();
            }
        },
    })
     
    // 隐藏底部工具栏
    // hideTime();
    // 监听 uni 的事件
    // bindUniEvents();
    nextTick(() => joinRoom());
})

onUnmounted(() => {
    console.warn('single call unmounted');
    clearTimeout(hideTimer);
    // 取消监听 uni 的网络状态
    // @ts-ignore
    // uni.offNetworkStatusChange()
})

// 监听 uni 事件
const bindUniEvents = () => {
    // @ts-ignore
    uni.offNetworkStatusChange();
    // @ts-ignore
    uni.onAppHide(()=>{
        console.warn('single call hide');
        clearTimeout(hideTimer)
        // endCall()
    })

    // @ts-ignore
    uni.onError((err) => {
        console.warn(`single call err, err: ${err}` );
    })

    // @ts-ignore
    uni.onNetworkStatusChange(res => {
        // if (res.isConnected && connectType === ConnectType.CONNECTED) {
            // zplogwarning('onNetworkStatusChange: roomID=', res)
            // FIXME this.reLogin();
            // android 断网重连拉流端会卡住，重新播放
            // player.value?.playerContext.play();
        // }
    })
}

// 按钮隐藏
const showBottomBar = ref(true);
let hideTimer = setTimeout(() => {
    showBottomBar.value = false
}, 5000); 


function showButton() {
    // 启动的时候默认设置为 true，此事件点击也是设置为 true，消失的时候通过定时器去执行
    // if (showMoreMenu.value) {
    //     showMoreMenu.value = !showMoreMenu.value
    // }
    // 点击切换显示隐藏，显示时5秒后隐藏
    clearTimeout(hideTimer);
    showBottomBar.value = !showBottomBar.value;
    if (showBottomBar.value === true) {
        hideTimer = setTimeout(()=>{
            showBottomBar.value = false
        }, 5000);
    }
}
</script>

<style scoped>
.single-call {
    display: flex;
    flex-direction: column;
    width: 100vw;
    height: 100vh;
    overflow: hidden;
}
.pic-in-pic-layout {
    width: 100%;
    height: 100%;
}

/* 按钮容器样式 */
.button-container {
    position: fixed;
    bottom: 0;
    display: flex;
    justify-content: space-evenly;
    align-items: center;
    width: 100%;
    height: 122rpx;
    /* 水平居中按钮 */
    margin-top: auto;
    background:rgba(28, 31, 46, 1); 
    border-top: 1rpx solid rgba(61, 64, 84, 1);
    z-index: 3;
}


.action-button {
    width: 76rpx;
    height: 76rpx;
    border: none;
    outline: none;
    border-radius: 18rpx;
    background: #313443;
    /* 根据需要调整背景色 */
    position: relative;
    /* 用于定位图标 */
}

.stop-call-button {
    background: #E8543B;
}

.icon {
    width: 56rpx;
    height: 56rpx;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    /* 居中定位 */
}

.text-image-container {
    position: absolute;
    bottom: 0;
    right: 5%;
    display: flex;
    align-items: center;
    z-index: 20;
}

.pushtext {
    font-family: PingFangSC-Regular;
    font-weight: 400;
    font-size: 16px;
    color: #FFFFFF;
}

.pushimage {
    width: 22px;
    height: 22px;
    margin-left: 5px;
}

.playertext {
    font-family: PingFangSC-Regular;
    font-weight: 400;
    font-size: 10px;
    color: #FFFFFF;
}

.playerimage {
    width: 18px;
    height: 18px;
    margin-left: 3px;
}

.more-menu-container {
    display: flex;
    align-items: center;
    height: 122rpx;
    /* 水平靠左排列按钮 */
    margin-top: auto;
    background-color: black; 
    padding: 0 40rpx;
    z-index: 11;
}

.camera-off-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;         /* 父容器宽度 */
  height: 100%;       /* 父容器高度，或者根据需要设置具体高度 */
  display: flex;       /* 使用 flex 布局 */
  justify-content: center;  /* 水平居中 */
  align-items: center;  /* 垂直居中 */
  background-color: #323544;
}

.centered-image {
    object-fit: cover;
    width: 40%;  
    height: 40%; 
    position: absolute; /* 绝对定位 */
    top: 50%;  /* 垂直方向居中 */
    left: 50%; /* 水平方向居中 */
    transform: translate(-50%, -50%); /* 将图片的中心点与父容器的中心对齐 */
}

</style>