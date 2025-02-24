import { ZegoUIKitUser } from '..';
export enum ZegoCallInvitationType {
    voiceCall,    // 视频通话
    videoCall,   //  语音通话
}
export interface ZegoUIKitPrebuiltCallConfig {
    /**
     * 默认是否启用摄像头，默认值为启用
     */
    turnOnCameraWhenJoining?: boolean;

    /**
     * 默认是否启用麦克风，默认为启用
     */
    turnOnMicrophoneWhenJoining?: boolean;

    /**
     * 呼叫模式
     */
    mode?: ZegoCallScenario;

    /**
     * token 过期回调
     */
    onTokenWillExpire?: (roomID: string) => void;

    /** 区分主包还是分包接入参数 */
    globalPagePath?: string
}

// export interface ZegoUIKitUser {
//     userID: string;
//     userName?: string;
//     isCameraOn?: boolean;
//     isMicrophoneOn?: boolean;
//     streamConfig?: any;
//     mainStreamID?: string;
//     shareStreamID?: string;
//     soundLevel?: number;
//     attributes?: Record<string, string>;
// }
export interface ZegoUIKitPrebuiltCallInvitationEvents {
    /**
     * 收到呼叫邀请，被呼者收到通知
     * @param callID 通话ID
     * @param caller 呼叫者信息
     * @param callType 通话类型
     * @param callees 被呼者列表
     * @param customData 自定义数据
     */
    onIncomingCallReceived?: (
        callID: string,
        caller: ZegoUIKitUser,
        callType: number,
        callees: ZegoUIKitUser[],
        customData: string,
    ) => void;

    /**
     * 呼叫者取消呼叫邀请时，被呼者收到通知
     * @param callID 通话ID
     * @param caller 呼叫者信息
     * @param customData 自定义数据
     */
    onIncomingCallCanceled?: (callID: string, caller: ZegoUIKitUser, customData: string) => void;

    /**
     * 被呼者收到呼叫超时通知
     * @param callID 通话ID
     * @param caller 呼叫者信息
     */
    onIncomingCallTimeout?: (callID: string, caller: ZegoUIKitUser) => void;

    /**
     * 被呼者点击呼叫邀请的接受按钮时，被呼者收到通知
     */
    onIncomingCallAcceptButtonPressed?: () => void;

    /**
     * 被呼者点击呼叫邀请的拒绝按钮时，被呼者收到通知
     */
    onIncomingCallDeclineButtonPressed?: () => void;

    /**
     * 呼叫邀请超时时，呼叫者收到通知
     * @param callID 通话ID
     * @param calleeID 被呼者ID
     * @param customData 自定义数据
     */
    onOutgoingCallTimeout?: (callID: string, calleeID: string, customData: string) => void;

    /**
     * 呼叫邀请被接受，呼叫者收到通知
     * @param callID 通话ID
     * @param calleeID 被呼者ID
     */
    onOutgoingCallAccepted?: (callID: string, calleeID: string) => void;

    /**
     * 呼叫邀请被拒绝(被呼者忙)，呼叫者收到通知
     * @param callID 通话ID
     * @param calleeID 被呼者ID
     * @param customData 自定义数据
     */
    onOutgoingCallRejectedCauseBusy?: (callID: string, calleeID: string, customData: string) => void;

    /**
     * 呼叫邀请被主动拒绝时，呼叫者收到通知
     * @param callID 通话ID
     * @param calleeID 被呼者ID
     */
    onOutgoingCallDeclined?: (callID: string, calleeID: string) => void;

    /**
     * 呼叫者点击取消呼叫邀请时，呼叫者收到通知
     */
    onOutgoingCallCancelButtonPressed?: () => void;

    /**
     * 结束通话时，呼叫者收到通知
     * @param callID 通话ID
     * @param roomID 房间ID
     */
    onCallEnded?: (callID: string, roomID: string) => void;
}

export enum ZegoCallInvitationRole {
    inviter,
    invitee,
}

export enum ZegoCallScenario {
    SINGLE_CALL,    // 1v1 单聊
    GROUP_CALL,   //  群聊
    CALL_INVITATION,
}

// prebuilt层事件监听
export interface PrebuiltListener {
    onInitialized?: () => void
    onLeaveRoom?: () => void
}