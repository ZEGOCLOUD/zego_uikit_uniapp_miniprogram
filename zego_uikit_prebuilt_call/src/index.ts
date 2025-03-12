import { ZegoUIKit, ZegoUIKitUser, ZegoUIKitListener } from '../zego_uikit/src';
import { ZegoUIKitPrebuiltCallConfig, ZegoUIKitPrebuiltCallInvitationEvents, ZegoCallInvitationRole, ZegoCallInvitationType, PrebuiltListener } from './services/define';
import PrebuiltCallCore from './services/internal/PrebuiltCallCore';

export * from '../zego_uikit/src';
export * from './utils';
export * from './services/define';
export class ZegoUIKitPrebuiltCall {
    /**
     * 初始化rtc和zim
     * @param appID 客户的appID
     * @param server 客户的server地址，初始化rtc需要
     * @param userID 用户ID
     * @param userName 用户名
     * @param token 访问令牌, 生产环境需要服务器生成, 下发下来
     * @param config 配置选项（可选）
     * @param invitationEvents 客户监听事件
     * @returns 初始化结果
     */
    static init(appID: number, server: string, userID: string, userName: string, token: string, config?: ZegoUIKitPrebuiltCallConfig, invitationEvents?: ZegoUIKitPrebuiltCallInvitationEvents) {
        return PrebuiltCallCore.getInstance().init(appID, server, userID, userName, token, config!, invitationEvents!);
    }

    /**
     * 更新令牌。
     * @param token 令牌字符串。
     * @param roomID 房间ID（可选）。
     * @returns 如果更新令牌成功，则返回true；否则返回false。
     */
    static renewToken(token: string, roomID?: string): boolean {
        return ZegoUIKit.renewToken(token, roomID);
    }

    /**
     * 加入房间
     * @param callID 通话ID, 相同 callID 的人将进行聊天
     * @returns 加入房间结果
     */
    static joinRoom(callID: string) {
        return PrebuiltCallCore.getInstance().joinRoom(callID);
    }

    /**
     * 发送邀请
     * @param type 邀请类型
     * @param invitees 被邀请者列表
     * @param customData 自定义数据
     * @returns 发送邀请结果
     */
    static onInvitationSent(type: number, invitees: any[], customData?: string) {
        return PrebuiltCallCore.getInstance().onInvitationSent(type, invitees, customData);
    }

    /**
     * 退出房间，zim相关
     * @returns 退出房间结果
     */
    static leaveRoom() {
        return PrebuiltCallCore.getInstance().leaveRoom();
    }

    /**
     * 退出房间，rtc相关
     * @returns 退出房间结果
     */
    static logoutRoom() {
        return ZegoUIKit.logoutRoom();
    }

    /**
     * 反初始化
     * @returns 反初始化结果
     */
    static unInit() {
        return PrebuiltCallCore.getInstance().unInit();
    }

    /**
     * 进行权限检查
     * @returns 权限检查结果
     */
    static authCheck() {
        return ZegoUIKit.authCheck();
    }

    /**
     * 导航返回
     * @returns 导航返回结果
     */
    static navigateBack() {
        return PrebuiltCallCore.navigateBack();
    }

    /**
     * 获取配置
     * @returns 配置
     */
    static getConfig() {
        return PrebuiltCallCore.getInstance().config;
    }

    /**
     * 获取当前角色，主叫者还是被叫者
     * @returns 当前角色
     */
    static getCurrentRole() {
        return PrebuiltCallCore.getInstance().role;
    }

    /**
     * 获取当前用户信息
     * @returns 当前用户信息
     */
    static getLocalUser() {
        return ZegoUIKit.getLocalUser();
    }

    /**
     * 获取 uikit 插件 zim
     * @returns uikit 插件 zim
     */
    static getSignalingPlugin() {
        return ZegoUIKit.getSignalingPlugin();
    }

    /**
     * 添加UIKit监听器
     * @param listenerID 监听器ID
     * @param listener 监听器
     */
    static addUIKitListener(listenerID: string, listener: ZegoUIKitListener) {
        return ZegoUIKit.addUIKitListener(listenerID, listener);
    }

    /**
     * 取消监听 uikit 回调事件
     * @param listenerID 监听器ID
     */
    static removeUIKitListener(listenerID: string) {
        return ZegoUIKit.removeUIKitListener(listenerID);
    }

    /**
     * 添加 Prebuilt 监听器
     * @param listenerID 监听器ID
     * @param listener 监听器
     */
    static addPrebuiltListener(listenerID: string, listener: PrebuiltListener) {
        return PrebuiltCallCore.getInstance().addPrebuiltListener(listenerID, listener);
    }

    /**
     * 取消监听 Prebuilt 回调事件
     * @param listenerID 监听器ID
     */
    static removePrebuiltListener(listenerID: string) {
        return PrebuiltCallCore.getInstance().removePrebuiltListener(listenerID);
    }

    /**
     * 监听来电取消事件
     * @param callID 通话ID
     * @param caller 呼叫者
     * @param customData 自定义数据
     * @returns 监听结果
     */
    static onIncomingCallCanceled(callID: string, caller: ZegoUIKitUser, customData: string) {
        return PrebuiltCallCore.getInstance().onIncomingCallCanceled(callID, caller, customData);
    }

    /**
     * 监听来电接听按钮按下事件
     * @returns 监听结果
     */
    static onIncomingCallAcceptButtonPressed() {
        return PrebuiltCallCore.getInstance().onIncomingCallAcceptButtonPressed();
    }

    /**
     * 监听来电拒绝按钮按下事件
     * @returns 监听结果
     */
    static onIncomingCallDeclineButtonPressed() {
        return PrebuiltCallCore.getInstance().onIncomingCallDeclineButtonPressed();
    }

    /**
     * 监听外呼被接受事件
     * @param callID 通话ID
     * @param calleeID 被叫者ID
     * @returns 监听结果
     */
    static onOutgoingCallAccepted(callID: string, calleeID: string) {
        return PrebuiltCallCore.getInstance().onOutgoingCallAccepted(callID, calleeID);
    }

    /**
     * 监听外呼取消按钮按下事件
     * @returns 监听结果
     */
    static onOutgoingCallCancelButtonPressed() {
        return PrebuiltCallCore.getInstance().onOutgoingCallCancelButtonPressed();
    }

    /**
     * 结束通话时，呼叫者收到通知
     * @param callID 通话ID
     * @param roomID 房间ID
     */
    static onCallEnded(callID: string, roomID: string) {
        return PrebuiltCallCore.getInstance().onCallEnded(callID, roomID);
    }

    /**
     * 发起通话邀请
     * @param params 通话邀请参数
     * @returns 接口调用结果
     */
    static sendCallInvitation(params: {
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
    }>{
        return PrebuiltCallCore.getInstance().sendCallInvitation(params);
    }
}
