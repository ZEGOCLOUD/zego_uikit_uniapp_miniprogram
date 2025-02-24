import UIKitCore from "./service/internal/UIKitCore"
import { ZegoUIKitUser, ZegoUIKitScenario, ZegoUIKitListener } from "./service/defines";
export * from './utils';
export class ZegoUIKit {
    public static init(appID: number, server: string, userID: string, userName: string, token: string, config?: any) {
        return UIKitCore.getInstance().init(appID, server, userID, userName, token, config);
    }
    public static unInit() {
        return UIKitCore.getInstance().unInit();
    }
    public static authCheck() {
        return UIKitCore.getInstance().authCheck();
    }
    public static joinRoom(roomID: string, token: string, user: ZegoUIKitUser, roomConfig: any) {
        return UIKitCore.getInstance().joinRoom(roomID, token, user, roomConfig);
    }
    public static renewToken(token: string, roomID?: string): boolean {
        return UIKitCore.getInstance().renewToken(token, roomID);
    }
    public static isLocalUser(userID: string) {
        return UIKitCore.getInstance().isLocalUser(userID);
    }
    public static updatePlayerState(streamID: string, event: any) {
        return UIKitCore.getInstance().express.updatePlayerState(streamID, event);
    }
    public static updatePlayerNetStatus(streamID: string, event: any) {
        return UIKitCore.getInstance().express.updatePlayerNetStatus(streamID, event);
    }
    public static updateAudioVolumeNotify(streamID: string, event:any) {
        return UIKitCore.getInstance().express.updateAudioVolumeNotify(streamID, event);
    }
    public static getLocalUser() {
        return UIKitCore.getInstance().getLocalUser();
    }
    public static setStreamExtraInfo(streamID: string, extraInfo: string) {
        return UIKitCore.getInstance().express.setStreamExtraInfo(streamID, extraInfo);
    }
    public static updateUser(user: ZegoUIKitUser) {
        return UIKitCore.getInstance().updateUser(user);
    }
    public static logoutRoom() {
        return UIKitCore.getInstance().logoutRoom();
    }
    public static getSignalingPlugin() {
        return UIKitCore.getInstance().invitationService;
    }
    public static addUIKitListener(listenerID: string, listener: ZegoUIKitListener) {
        return UIKitCore.getInstance().addUIKitListener(listenerID, listener);
    }
    public static removeUIKitListener(listenerID: string) {
        return UIKitCore.getInstance().removeUIKitListener(listenerID);
    }
    public static getCurrentMode() {
        return UIKitCore.getInstance().mode;
    }
}

export * from './service/defines';