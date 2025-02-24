
<template>
	<view class="container">
		<!-- UI组件 -->
		<InvitationCall v-if="isUIKitShow"/>
		<view class="upload-log" @click="upload">zim</view>
		<view class="user-box">
			<div class="default-avatar">{{ userName?.substring(0, 1).toLocaleUpperCase() }}</div>
			<view class="user-info">
				<view class="user-name">{{ userName }}</view>
				<view class="user-id">ID: {{ userID }}</view>
			</view>
		</view>
		<view class="content">
			<view class="title-box">
				<view class="title">直接进行呼叫</view>
			</view>
			<view class='input-container'>
				<input v-model="userIDList" placeholder="用户 ID" placeholder-style='color: #b3b3b3; font-size: 14px;line-height:98rpx' style="height: 98rpx;"
					class="input" />
			</view>
			<view class="button-container">
				<ZegoSendCallInvitationButton
					class="btn video-btn"
					:isVideoCall="true"
					:invitees="invitees"
					text="视频通话"
					:customData="customData"
					:timeout="120"
					:onPressed="sendCallback">
				</ZegoSendCallInvitationButton>
				<ZegoSendCallInvitationButton
					class="btn voice-btn"
					:isVideoCall="false"
					:invitees="invitees"
					text="语音通话"
					:customData="customData"
					:timeout="120"
					:onPressed="sendCallback">
				</ZegoSendCallInvitationButton>
			</view>
		</view>
	</view>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, onUnmounted, getCurrentInstance } from 'vue';
// 引入 prebuiltCall
import { ZegoUIKitPrebuiltCall, ZegoCallScenario, ZegoUIKitUser, makePrebuiltListenerID, ZegoUIKitPrebuiltCallConfig } from '@zegocloud/zego-uikit-prebuilt-call-mini-program';
// import { ZegoUIKitPrebuiltCall, ZegoUIKitUser } from '@zegocloud/zego-uikit-prebuilt-uniapp-test';
// import ZegoSendCallInvitationButton from '../../../ZegoUIKitPrebuiltCall/src/components/ZegoSendCallInvitationButton.vue';
import ZegoSendCallInvitationButton from '../src/components/ZegoSendCallInvitationButton.vue';
import InvitationCall from '../src/pages/call_invitation/invitationCall.vue';

const userIDList = ref('');
const invitees: any = computed(()=>{
	const list = userIDList.value.split(',');
	return userIDList.value ? list.map((id)=>({ userID: id, userName: 'user_' + id })) : [];
})

const customData = ref("测试额外参数");
function getRandomIndex(): string {
	const randomNumber = Math.floor(Math.random() * 100000); // 生成0到99999的随机整数
	return randomNumber.toString().padStart(5, '0'); // 将数字转换为字符串，并用'0'填充到长度为5
}

const userID = ref<string>(getRandomIndex());
let userName= ref<string>("");
const LISTENER_ID = makePrebuiltListenerID(); // 生成回调ID
const isUIKitShow = ref<boolean>(false);
const isSingleCallShow = ref<boolean>(false);

onMounted(() => {
	const instance = getCurrentInstance()?.proxy;
	// @ts-ignore
    const eventChannel = instance?.getOpenerEventChannel();
	if (eventChannel) {
		eventChannel.on('acceptDataFromOpenerPage', function(data) {
			console.log('acceptDataFromOpenerPage', data, ZegoUIKitPrebuiltCall);
			userID.value = data.userID;
			userName.value = data.userName;
			const events = {
				onIncomingCallReceived: (callID: string, caller: ZegoUIKitUser,  callType: number, callees: ZegoUIKitUser[], customData: string) => {
					console.warn('[demo]onIncomingCallReceived', callID, caller, callType, callees, customData);
				},
				onIncomingCallCanceled: (callID: string, caller: ZegoUIKitUser, customData: string) =>{
					console.warn('[demo]onIncomingCallCanceled', callID, caller, customData);
					showToast(`${caller.userID}已取消呼叫邀请`);
				},
				onIncomingCallAcceptButtonPressed: () => {
					console.warn('[demo]onIncomingCallAcceptButtonPressed');
				},
				onIncomingCallDeclineButtonPressed: () => {
					console.warn('[demo]onIncomingCallDeclineButtonPressed');
				},
				onOutgoingCallCancelButtonPressed: () => {
					console.warn('[demo]onOutgoingCallCancelButtonPressed');
				},
				onOutgoingCallAccepted: (callID: string, calleeID: string) =>{
					console.warn('[demo]onOutgoingCallAccepted', callID, calleeID);
				},
				onOutgoingCallDeclined: (callID: string, calleeID: string) =>{
					console.warn('[demo]onOutgoingCallDeclined', callID, calleeID);
					showToast(`${calleeID} 已拒绝`);
				},
				onOutgoingCallRejectedCauseBusy: (callID: string, calleeID: string, customData: string) => {
					console.warn('[demo]onOutgoingCallRejectedCauseBusy', callID, calleeID, customData);
					showToast( `${calleeID} 忙！`);
				},
				onOutgoingCallTimeout: (callID: string, calleeID: string, customData: string) => {
					console.warn('[demo]onOutgoingCallTimeout', callID, calleeID, customData);
					showToast('呼叫超时！');
				},
				onIncomingCallTimeout: (callID: string, caller: ZegoUIKitUser) => {
					console.warn('[demo]onIncomingCallTimeout', callID, caller);
					showToast('呼叫超时！');
				},
				onCallEnded: (callID: string, roomID: string) => {
					console.warn('[demo]onCallEnded', callID, roomID);
					showToast('呼叫结束');
				}
			}
			
			ZegoUIKitPrebuiltCall.init(data.appID, data.server, data.userID, data.userName, data.token, data.config, events)
				.then((res)=>{
					console.log('[demo]init res', res);
					// 测试发起通话邀请接口
					// const callees = [{userID: '02181', userName: 'user_02181'}];
					// ZegoUIKitPrebuiltCall.sendCallInvitation({callees, callType: 1}).then((res)=>{
					// 	!res.code && ZegoUIKitPrebuiltCall.onInvitationSent(1, callees)
					// });
				})
				.catch((err)=>{
					console.log('[demo]init err', err);
					showToast('初始化失败，请稍后重试');
				});

			ZegoUIKitPrebuiltCall.addPrebuiltListener(LISTENER_ID, {
				onInitialized: () => {
					console.log('[demo]onInitialized');
					isUIKitShow.value = true;
				},
			})
		});
	}
})

onUnmounted(() => {
	console.warn('[demo]unmounted');
	ZegoUIKitPrebuiltCall.removePrebuiltListener(LISTENER_ID);
	ZegoUIKitPrebuiltCall.unInit();
})
const sendCallback = (code: number, message: string, errorInvitees: string[]) => {
	console.log('[demo]收到点击开始呼叫邀请按钮回调', code, message, errorInvitees);
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
	/* display: flex;
	flex-direction: column;
	height: 100vh;
	font-family: PingFangSC-SNaNrpxibold; */
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
.user-info {
	display: flex;
	flex-direction: column;
	margin-left: 18rpx;
}
.user-name {
	font-size: 30rpx;
	font-weight: 500;
	color: #333;
}
.user-id {
	font-size: 20rpx;
	font-weight: 400;
	color: #666;
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
.video-btn {
	margin-bottom: 32rpx;
	background-color: #0055FF;
}
.voice-btn {
	border: 2rpx solid #0055FF;
	background-color: #fff;
	color: #0055FF;
}

.bottom-box {
	margin-bottom: 22rpx;
	text-align: center;
	color: #ABABB5;
	font-size: 24rpx;
}
</style>
