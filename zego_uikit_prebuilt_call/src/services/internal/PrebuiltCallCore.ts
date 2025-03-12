import { ZegoCallInvitationType, ZegoUIKitPrebuiltCallConfig, ZegoUIKitPrebuiltCallInvitationEvents,ZegoCallInvitationRole, ZegoCallScenario, PrebuiltListener } from "../define";
import { ZegoUIKit, ZegoUIKitUser, ZegoUIKitScenario } from "../../../zego_uikit/src";
import { makePrebuiltListenerID, zploginfo, zplogerror, zplogwarning } from '../../utils';
import { NotifyList } from "./NotifyList";
export default class PrebuiltCallCore {
    static instance: PrebuiltCallCore;
    static getInstance(): PrebuiltCallCore {
        if (!PrebuiltCallCore.instance) {
            PrebuiltCallCore.instance = new PrebuiltCallCore();
        }
        return PrebuiltCallCore.instance;
    }
    type!: number;
    token!: string;
    localUser!: ZegoUIKitUser;
    defaultConfig: ZegoUIKitPrebuiltCallConfig = {
        turnOnCameraWhenJoining: true,
        turnOnMicrophoneWhenJoining: true,
        mode: ZegoCallScenario.SINGLE_CALL,
    };
    customConfig!: ZegoUIKitPrebuiltCallConfig;
    config!: ZegoUIKitPrebuiltCallConfig;
    invitationEvents?: ZegoUIKitPrebuiltCallInvitationEvents;
    LISTENER_ID: string = makePrebuiltListenerID() // 生成回调ID
    role!: ZegoCallInvitationRole;
    callID!: string;
    private prebuiltListeners: NotifyList<PrebuiltListener> = new NotifyList();

    public init (appID: number, server: string, userID: string, userName: string, token: string, config: ZegoUIKitPrebuiltCallConfig, invitationEvents: ZegoUIKitPrebuiltCallInvitationEvents) {
        this.token = token;
        this.localUser = {userID, userName, avatar:`https://api.multiavatar.com/${userID}.svg?apikey=XqHm465NYsdLfb`, isCameraOn: true, isMicrophoneOn: true};
        this.invitationEvents = invitationEvents;
        this.customConfig = config;
        this.config = { ...this.defaultConfig, ...config };
        zploginfo('init', this.config);
        return ZegoUIKit.init(appID, server, userID, userName, token, this.config)
            .then((res)=>{
                // 注册事件
                if (!res) return;
                if (this.config.mode === ZegoCallScenario.CALL_INVITATION) {
                    ZegoUIKit.getSignalingPlugin().addCallInvitationListener(this.LISTENER_ID, {
                        onCallInvitationCreated: (callID, extendedData) => {
                            zploginfo('[PrebuiltCallCore]onCallInvitationCreated', callID, extendedData, this.config);
                            if (this.config.globalPagePath) {
                                const extendedDataJson = JSON.parse(extendedData);
                                const callData = JSON.parse(extendedDataJson.data);
                                const { invitees, custom_data } = callData;
                                // 跳转呼叫邀请页
                                PrebuiltCallCore.navigateTo(this.config.globalPagePath, 'dataFromCallInvitation', {invitees});
                            }
                        },
                        onCallInvitationReceived: (callID, extendedData) => {
                            zplogwarning('[PrebuiltCallCore]onCallInvitationReceived', callID, extendedData);
                            const extendedDataJson = JSON.parse(extendedData);
                            const callData = JSON.parse(extendedDataJson.data);
                            this.type = extendedDataJson.type ?? callData.type;
                            zplogwarning('[PrebuiltCallCore]onCallInvitationReceived type', extendedDataJson, this.type);
                            // 收到呼叫邀请, 跳转到被呼叫者页面
                            if(this.config.globalPagePath) {
                                PrebuiltCallCore.navigateTo(this.config.globalPagePath, 'dataFromCallInvitation', {callID, caller: { userID: callData.inviter.id, userName: callData.inviter.name }});
                            }
                            // PrebuiltCallCore.navigateTo(
                            //     '/zego_uikit_prebuilt_call/src/pages/call_invitation/ZegoCallInviteePage',
                            //     'dataFromCallInvitation',
                            //     { callID, caller: { userID: callData.inviter.id, userName: callData.inviter.name }, extendedData});
                            // 通知业务层
                            PrebuiltCallCore.getInstance().onIncomingCallReceived(callID,
                                { userID: callData.inviter.id, userName: callData.inviter.name }, callData.type, callData.invitees, callData.custom_data);
                        },
                        onCallInvitationRefused: (callID, callerID, calleeID, extendedData) => {
                            zploginfo('===onCallInvitationRefused', callID, calleeID, extendedData);
                            if (callerID === PrebuiltCallCore.getInstance().localUser.userID) {
                                const data = extendedData && JSON.parse(extendedData);
                                switch(data?.reason) {
                                    case 'decline':
                                        PrebuiltCallCore.getInstance().onOutgoingCallDeclined(callID, calleeID);
                                        break;
                                    case 'busy':
                                        PrebuiltCallCore.getInstance().onOutgoingCallRejectedCauseBusy(callID, calleeID);
                                        break;
                                }
                            }
                        },
                        onCallInvitationAccepted: (callID, callerID, calleeID) => {
                            if (callerID === PrebuiltCallCore.getInstance().localUser.userID) {
                                PrebuiltCallCore.getInstance().onOutgoingCallAccepted(callID, calleeID);
                            }
                            PrebuiltCallCore.getInstance().joinRoom(callID, ZegoCallInvitationRole.inviter);
                        },
                        onCallInvitationCancelled: (callID, caller, extendedData) => {
                            if (caller.userID !== PrebuiltCallCore.getInstance().localUser.userID) {
                                PrebuiltCallCore.getInstance().onIncomingCallCanceled(callID, caller, extendedData);
                            }
                        },
                        onCallInvitationTimeoutofInviter: (callID, calleeID, extendedData) => {
                            zploginfo('[PrebuiltCallCore]onCallInvitationTimeoutofInviter', callID);
                            PrebuiltCallCore.getInstance().onOutgoingCallTimeout(callID, calleeID, extendedData);
                        },
                        onCallInvitationTimeoutofInvitee: (callID, caller) => {
                            zploginfo('[PrebuiltCallCore]onCallInvitationTimeoutofInvitee', callID, caller);
                            PrebuiltCallCore.getInstance().onIncomingCallTimeout(callID, caller);
                        },
                    })
                 
                }
                // 通知UI层登录成功
                this.prebuiltListeners.notifyAllListener((prebuiltListeners)=> {
                    prebuiltListeners.onInitialized?.();
                })
                return Promise.resolve(true);
            })
            .catch((err)=>{
                zplogerror(err);
                return Promise.reject(false);
            });
    }

    public unInit() {
        if (this.config.mode === ZegoCallScenario.CALL_INVITATION) {
            ZegoUIKit.getSignalingPlugin().removeCallInvitationListener(this.LISTENER_ID);
        }
        ZegoUIKit.unInit();
    }

    public sendCallInvitation(params: {
        callees: ZegoUIKitUser[],
        callType: ZegoCallInvitationType,
        customData?: string,
        timeout?: number,
        roomID?: string}
    ): Promise<{
        code: number;
        callID: string;
        timeout: number;
        errorUserList: {userID: string, reason: number}[];
        customData: string;
    }> {
        const { callees, callType, timeout = 60, roomID, customData = "" } = params;
        if (!Array.isArray(callees) || callees.length < 1) {
			return Promise.reject("【ZEGOUIKIT】sendCallInvitation params error: callees !!");
		} else if (callees.length > 9) {
			return Promise.reject("【ZEGOUIKIT】Maximum number of users exceeded");
		}
		if (callType !== ZegoCallInvitationType.videoCall && callType !== ZegoCallInvitationType.voiceCall) {
			return Promise.reject("【ZEGOUIKIT】sendCallInvitation params error: callType !!");
		}
        return ZegoUIKit.getSignalingPlugin().sendInvitation(callees, callType, customData, timeout, roomID);
    }

    public onInvitationSent(type: number, invitees: any[], customData?: string) {
        console.log('[PrebuiltCallCore]oninvitation sent', invitees);
        this.type = type;
        // 跳转呼叫邀请等待页
        // PrebuiltCallCore.navigateTo('/zego_uikit_prebuilt_call/src/pages/call_invitation/ZegoCallInviterPage', 'dataFromSendInvitation', { invitees, customData })
    }
    // 加入房间
    public joinRoom(callID: string, role?: ZegoCallInvitationRole) {
        this.role = role!;
        // this.config = { ...this.defaultConfig, ...this.customConfig };
        // 根据 type 值设置 user 的摄像头/麦克风状态
        if (this.type === ZegoCallInvitationType.voiceCall) {
            this.localUser.isCameraOn = this.customConfig.turnOnCameraWhenJoining ?? false;
            this.config.turnOnCameraWhenJoining = this.localUser.isCameraOn;
        }
        // 从语音通话切换到视频通话，未重新初始化时需要重新设置 turnOnCameraWhenJoining 的值，不然视频通话会关闭摄像头
        if (this.type === ZegoCallInvitationType.videoCall) {
            this.localUser.isCameraOn = this.customConfig.turnOnCameraWhenJoining ?? true;
            this.config.turnOnCameraWhenJoining = this.localUser.isCameraOn;
        }
        zplogwarning('joinRoom', this.config, this.customConfig, this.defaultConfig);
        ZegoUIKit.joinRoom(callID, this.token, this.localUser, this.config);
        if (this.config.globalPagePath && this.config.mode === ZegoCallScenario.SINGLE_CALL) {
            PrebuiltCallCore.navigateTo(this.config.globalPagePath, "dataFromCall", { config: this.config });
        }
    }

    // 离开房间
    public leaveRoom() {
        // 通知 UI 层离开房间
        this.prebuiltListeners.notifyAllListener((prebuiltListeners) => {
            prebuiltListeners.onLeaveRoom?.();
        })
    }

    // 结束呼叫邀请
    public endInvitation() {
        ZegoUIKit.getSignalingPlugin().zimCallID = '';
    }

    // 收到呼叫邀请，被呼者收到通知
    public onIncomingCallReceived(callID: string, caller: ZegoUIKitUser, type: number, callees: ZegoUIKitUser[], customData: string) {
        if(this.invitationEvents && this.invitationEvents.onIncomingCallReceived){
            this.invitationEvents.onIncomingCallReceived(callID, caller, type, callees, customData);
        }
    }
     // 呼叫者取消呼叫邀请时，被呼者收到通知
     public onIncomingCallCanceled(callID: string, caller: ZegoUIKitUser, customData: string) {
        if(this.invitationEvents && this.invitationEvents.onIncomingCallCanceled){
            this.invitationEvents.onIncomingCallCanceled(callID, caller, customData);
        }
    }
    // 呼叫邀请超时时，被呼者收到通知
    public onIncomingCallTimeout(callID: string, caller: ZegoUIKitUser) {
        if(this.invitationEvents && this.invitationEvents.onIncomingCallTimeout) {
            this.invitationEvents.onIncomingCallTimeout(callID, caller);
        }
    }
    // 点击呼叫邀请的接受按钮时，被呼者收到通知
    public onIncomingCallAcceptButtonPressed() {
        if(this.invitationEvents && this.invitationEvents.onIncomingCallAcceptButtonPressed) {
            this.invitationEvents.onIncomingCallAcceptButtonPressed();
        }
    }
    // 点击呼叫邀请的拒绝按钮时，被呼者收到通知
    public onIncomingCallDeclineButtonPressed() {
        if(this.invitationEvents && this.invitationEvents.onIncomingCallDeclineButtonPressed) {
            this.invitationEvents.onIncomingCallDeclineButtonPressed();
        }
    }
    // 呼叫邀请超时时，呼叫者收到通知
    public onOutgoingCallTimeout(callID: string, calleeID: string, customData?: string) {
        if(this.invitationEvents && this.invitationEvents.onOutgoingCallTimeout) {
            this.invitationEvents.onOutgoingCallTimeout(callID, calleeID, customData!);
        }
    }
    // 呼叫邀请被接受，呼叫者收到通知
    public onOutgoingCallAccepted(callID: string, calleeID: string) {
        if(this.invitationEvents && this.invitationEvents.onOutgoingCallAccepted) {
            this.invitationEvents.onOutgoingCallAccepted(callID, calleeID);
        }
    }
    // 呼叫邀请被拒绝(被呼者忙)，呼叫者收到通知
    public onOutgoingCallRejectedCauseBusy(callID: string, calleeID: string, customData?: string) {
        if(this.invitationEvents && this.invitationEvents.onOutgoingCallRejectedCauseBusy) {
            this.invitationEvents.onOutgoingCallRejectedCauseBusy(callID, calleeID, customData!);
        }
    }
    // 呼叫邀请被主动拒绝时，呼叫者收到通知
    public onOutgoingCallDeclined(callID: string, calleeID: string) {
        if(this.invitationEvents && this.invitationEvents.onOutgoingCallDeclined) {
            this.invitationEvents.onOutgoingCallDeclined(callID, calleeID);
        }
    }
    // 呼叫者点击取消呼叫邀请时，呼叫者收到通知
    public onOutgoingCallCancelButtonPressed() {
        if(this.invitationEvents && this.invitationEvents.onOutgoingCallCancelButtonPressed) {
            this.invitationEvents.onOutgoingCallCancelButtonPressed();
        }
    };

    // 结束通话时，呼叫者会收到通知
    public onCallEnded(callID: string, roomID: string) {
        if(this.invitationEvents && this.invitationEvents.onCallEnded) {
            this.invitationEvents.onCallEnded(callID, roomID);
        }
    }

    public addPrebuiltListener(listenerID: string, listener: PrebuiltListener) {
        this.prebuiltListeners.addListener(listenerID, listener);
    }
    public removePrebuiltListener(listenerID: string){
        this.prebuiltListeners.removeListener(listenerID);
    }

    static navigateTo(pagePath: string, eventName?: string, eventData?: any) {
        // @ts-ignore
        wx.navigateTo({
            url: pagePath,
            animationType: 'slide-in-top',
            success: (res: any) => {
                eventName && res.eventChannel.emit(eventName, { ...eventData })
            },
            fail: () => {
                console.error(`navigateTo fail!`);
            },
            complete: () => { },
        });
    }

    static navigateBack() {
        // @ts-ignore
        wx.navigateBack({
            success: () => { },
            fail: () => {
                console.error(`$navigateBack fail!`);
            },
            complete: () => { },
        });
    }

    static redirectTo(pagePath: string, eventName?: string, eventData?: any) {
        // @ts-ignore
        wx.redirectTo({
            url: pagePath,
            animationType: 'slide-in-top',
            success: (res: any) => {
                eventName && res.eventChannel.emit(eventName, { ...eventData })
            },
            fail: () => {
                console.error(`redirectTo fail!`);
            },
            complete: () => { },
        });
    }
}
