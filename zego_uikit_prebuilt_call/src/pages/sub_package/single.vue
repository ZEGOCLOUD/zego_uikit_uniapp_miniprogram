
<template>
	<view class="container">
		<!-- UI组件 -->
		<SingleCall v-if="isSingleCallShow"></SingleCall>
		<view class="upload-log" @click="upload">zim</view>
        <view class="content">
            <!-- 输入框 -->
            <view class='input-container'>
                <text class="title">输入房间ID</text>
                <input v-model="callID" placeholder="请输入房间 ID" placeholder-style='color: #b3b3b3; font-size: 14px;line-height:98rpx'  style="height: 98rpx;"
                    class="input" />
            </view>
            <!-- 按钮 -->
            <view class="button-container">
                <button @tap="startCall" hover-class="none">
                    拨打电话
                </button>
            </view>
        </view>
	</view>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted, getCurrentInstance } from 'vue';
import { ZegoUIKitPrebuiltCall, ZegoUIKitUser, makePrebuiltListenerID, ZegoUIKitPrebuiltCallConfig } from '@zegocloud/zego-uikit-prebuilt-call-mini-program';
import SingleCall from '../src/pages/call/SingleCall.vue';

function getRandomIndex(): string {
	const randomNumber = Math.floor(Math.random() * 100000); // 生成0到99999的随机整数
	return randomNumber.toString().padStart(5, '0'); // 将数字转换为字符串，并用'0'填充到长度为5
}

const userID = ref<string>(getRandomIndex());
let userName= ref<string>("");
const LISTENER_ID = makePrebuiltListenerID(); // 生成回调ID
const isSingleCallShow = ref<boolean>(false);
const callID = ref("2131602");

onMounted(() => {
	const instance = getCurrentInstance()?.proxy;
	// @ts-ignore
    const eventChannel = instance?.getOpenerEventChannel();
	if (eventChannel) {
		eventChannel.on('acceptDataFromOpenerPage', function(data) {
			console.log('acceptDataFromOpenerPage', data, ZegoUIKitPrebuiltCall);
			userID.value = data.userID;
			userName.value = data.userName;
			
			ZegoUIKitPrebuiltCall.init(data.APPID, data.SERVER, data.userID, data.userName, data.token, data.config)
				.then((res: any)=>{
					console.log('[demo]init res', res);
					// ZegoUIKitPrebuiltCall.joinRoom(callID.value);
					// isSingleCallShow.value = true;
					// 测试发起通话邀请接口
					// const callees = [{userID: '02181', userName: 'user_02181'}];
					// ZegoUIKitPrebuiltCall.sendCallInvitation({callees, callType: 1}).then((res)=>{
					// 	!res.code && ZegoUIKitPrebuiltCall.onInvitationSent(1, callees)
					// });
				})
				.catch((err: any)=>{
					console.log('[demo]init err', err);
					showToast('初始化失败，请稍后重试');
				});

			ZegoUIKitPrebuiltCall.addPrebuiltListener(LISTENER_ID, {
				onInitialized: () => {
					console.log('[demo]onInitialized');
				},
				onLeaveRoom: () => {
					isSingleCallShow.value = false;
				}
			})
		});
	}
})

onUnmounted(() => {
	console.warn('[demo]unmounted');
	ZegoUIKitPrebuiltCall.removePrebuiltListener(LISTENER_ID);
	ZegoUIKitPrebuiltCall.unInit();
})

function startCall() {
	if (userID.value) {
		ZegoUIKitPrebuiltCall.joinRoom(callID.value);
		isSingleCallShow.value = true;
	}
}

const showToast = (title: string) => {
	setTimeout(() => {
		// @ts-ignore
		wx.showToast({
			title: title,
			icon: "none",
		});
	}, 500);
}


const upload = () => {
	console.warn('[demo]upload zim log');
	ZegoUIKitPrebuiltCall.getSignalingPlugin().zim.uploadLog();
} 
</script>

<style scoped>
.container {
	
}
.upload-log {
	z-index: 100;
	position: absolute;
	top: 6px;
	left: 6px;
	width: 30px;
	height: 20px;
	background: #08cb28;
	font-size: 12px;
}
.user-box {
	display: flex;
	justify-content: flex-start;
	padding: 22rpx 36rpx;
}
.default-avatar {
	display: flex;
	justify-content: center;
	align-items: center;
	width: 65rpx;
	height: 65rpx;
	font-weight: 600;
	font-size: 32rpx;
	background-color: #3a3d4a;
	color: #FFFFFF;
	border-radius: 100%;
}
.avatar {
	display: flex;
	justify-content: center;
	align-items: center;
	width: 65rpx;
	height: 65rpx;
	background-color: #3A3D4A;
	color: #FFFFFF;
	border-radius: 100%;
}

.content {
	flex-grow: 1;
	display: flex;
	flex-direction: column;
	padding: 140rpx 90rpx 0;
}
.title-box {
	display: flex;
	flex-direction: column;
	margin-bottom: 64rpx;
}
.title {
	margin-bottom: 6rpx;
	line-height: 62rpx;
	font-size: 44rpx;
	color: #2A2A2A;
}

.input-container {
	margin-bottom: 64rpx;
}

.input {
	padding: 0rpx 30rpx;
	font-size: 32rpx;
	border: 2rpx solid #333;
	border-radius: 18rpx;
}

.button-container {
	display: flex;
	flex-direction: column;
	justify-content: center;
}

.btn {
	text-align: center;
	width: 570rpx;
	height: 100rpx;
	line-height: 100rpx;
	font-size: 32rpx;
	color: #fff;
	border-radius: 20rpx;
}

.content {
	flex-grow: 1;
	display: flex;
	flex-direction: column;
	padding: 140rpx 90rpx 0;
}
</style>
