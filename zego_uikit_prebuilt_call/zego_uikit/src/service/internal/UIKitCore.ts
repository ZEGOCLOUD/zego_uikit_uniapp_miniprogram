
import { ZegoExpressEngine } from "zego-express-engine-miniprogram";
import { ZegoRoomStateChangedReason, ZegoUser } from "zego-express-engine-webrtm/sdk/code/zh/ZegoExpressEntity";
import { zloginfo, zlogwarning, zlogerror, makeListenerID } from "../../utils";
import { startPush, stopPush, startPlay, stopPlay, bindEventListeners, unbindEventListeners } from './ZegoExpressService';
import { ZegoUIKitListener, ZegoUIKitConfig, ZegoUIKitUser, ZegoUIKitScenario } from '../defines';
import InvitationService from './invitation/InvitationService';
import { NotifyList } from './NotifyList';
export default class UIKitCore {
    static instance: UIKitCore;
    static getInstance(): UIKitCore {
        if (!UIKitCore.instance) {
            UIKitCore.instance = new UIKitCore();
        }
        return UIKitCore.instance;
    }
    static get runtime() {
        //@ts-ignore
        return uni;
    }
    express!: ZegoExpressEngine;
    invitationService!: InvitationService;
    localUser!: ZegoUIKitUser;
    roomID!: string;
    mode: ZegoUIKitScenario = ZegoUIKitScenario.SINGLE_CALL;
    userList: ZegoUIKitUser[] = [];
    config!: ZegoUIKitConfig;
    LISTENER_ID: string = makeListenerID() // 生成回调ID

    private uikitListeners: NotifyList<ZegoUIKitListener> = new NotifyList();
    private initEventHandler = {
        async roomStreamUpdate(roomID: string, updateType: 'DELETE' | 'ADD', streamList: {
            streamID: string;
            user: ZegoUser;
            extraInfo: string;
        }[]) {
            zlogwarning("roomStreamUpdate", roomID, updateType, streamList);
            const userList = UIKitCore.getInstance().userList;
            if (updateType === "ADD") {
                try {
                    zlogwarning("roomStreamUpdate", userList);
                    streamList.forEach(async (stream)=>{
                        const extraInfo = JSON.parse(stream.extraInfo);
                        // if(userList.some((user: ZegoUIKitUser) => user.userID === stream.user.userID)){
                            zlogwarning("roomStreamUpdate 流新增用户在用户列表里", userList);
                            const player = await startPlay(stream.streamID);
                            if (player) {
                                const user = userList.filter((u: ZegoUIKitUser)=> u.userID === streamList[0].user.userID)[0];
                                if (user) {
                                    user.isCameraOn = extraInfo.isCameraOn;
                                    user.isMicrophoneOn = extraInfo.isMicrophoneOn;
                                    user.streamConfig = player;
                                    user.mainStreamID = stream.streamID;
                                    UIKitCore.getInstance().updateUser(user);
                                } else {
                                    const user: ZegoUIKitUser = {
                                        userID: stream.user.userID,
                                        userName: stream.user.userName,
                                        isCameraOn: extraInfo.isCameraOn,
                                        isMicrophoneOn: extraInfo.isMicrophoneOn,
                                        streamConfig: player,
                                        mainStreamID: stream.streamID,
                                    };
                                    UIKitCore.getInstance().userJoin(user);
                                }
                            }
                    })
                } catch (error) {
                    zlogerror("roomStreamUpdate add error", error);
                    return;
                }
            } else {
                // 流删除
                try {
                    streamList.forEach(async (stream)=>{
                        if(userList.some((user: ZegoUIKitUser) => user.userID === stream.user.userID)){
                            stopPlay(stream.streamID);
                            // TODO: userLeave 会触发两次，这里先把流删除的注释，待系统测试反馈再做调整
                            // UIKitCore.getInstance().userLeave(stream.user);
                        }
                    })
                } catch (error) {
                    zlogerror("roomStreamUpdate delete error", error);
                    return;
                }
            }
        },
        streamExtraInfoUpdate(roomID: string, streamList: {
            streamID: string;
            user: ZegoUser;
            extraInfo: string;
        }[]) {
            zloginfo("streamExtraInfoUpdate streamList: ", streamList, streamList[0].extraInfo);
            //TODO: 这里先拿第一个，因为目前只有 1v1 场景，后续扩展多人聊天需要改掉
            const extraInfo = JSON.parse(streamList[0].extraInfo);
            const userList = UIKitCore.getInstance().userList;
            const user = userList.filter((u: ZegoUIKitUser)=> u.userID === streamList[0].user.userID)[0];
            zloginfo("streamExtraInfoUpdate user: ", user, userList);
            if (user) {
                user.isCameraOn = extraInfo.isCameraOn;
                user.isMicrophoneOn = extraInfo.isMicrophoneOn;
            }
            UIKitCore.getInstance().updateUser(user);
        },
        roomUserUpdate(roomID: string, updateType: 'DELETE' | 'ADD', userList: ZegoUser[]) {
            zlogwarning("roomUserUpdate, roomID: ", roomID, updateType, userList);
            if (updateType === "DELETE") {
                userList.forEach((user) => {
                    UIKitCore.getInstance().userLeave(user);
                });
            } else if (updateType === "ADD") {
                userList.forEach((user) => {
                    UIKitCore.getInstance().userJoin(user);
                });
            }
        },
        // 当房间的连接状态改变时触发该回调，并通知改变的原因。
        roomStateChanged(roomID: string, reason: ZegoRoomStateChangedReason, errorCode: number, extendedData: string) {
            zlogwarning("roomStateChanged", roomID, reason, errorCode, extendedData);
            if (reason === 'RECONNECTED') {
                UIKitCore.getInstance().uikitListeners.notifyAllListener((uikitListeners)=>{
                    uikitListeners.onReconnected?.();
                })
            }
        },
        tokenWillExpire(roomID: string) {
            zlogerror("express tokenWillExpire", roomID, this.invitationService);
            if (!this.invitationService) {
                this.config.onTokenWillExpire && this.config.onTokenWillExpire(roomID);
            }
        },
        remoteCameraStatusUpdate(state: any) {
            zlogerror("remoteCameraStatusUpdate", state);
        }
        // publisherStateUpdate(result) {
        //     zlogwarning("publishStateUpdate", result);
        // },
        // playerStateUpdate(result) {
        //     zlogwarning("playStateUpdate", result);
        // },
        // publishQualityUpdate(streamID, publishStats) {
        //     // zlogwarning("publishQualityUpdate", streamID, publishStats);
        // },
        // playQualityUpdate(streamID, playStats) {
        //     // zlogwarning("playQualityUpdate", streamID, playStats);
        // },
        // roomOnlineUserCountUpdate(roomID, userCount) {
        //     zlogwarning("roomOnlineUserCountUpdate", roomID, userCount)
        // },
    }

    // 初始化 express 和 zim
    public async init(appID: number, server: string, userID: string, userName: string, token: string, config: ZegoUIKitConfig): Promise<boolean> {
        zloginfo(`new instance of ZegoExpressService, appID=${appID}, server=${server},  mode=${config.mode}`, config);
        this.config = config;
        this.mode = config.mode as ZegoUIKitScenario;
        UIKitCore.getInstance().express = new ZegoExpressEngine(appID, server);
        zloginfo("version", UIKitCore.getInstance().express.getVersion(), UIKitCore.getInstance().express);
        UIKitCore.getInstance().express.setDebugVerbose(false);
        UIKitCore.getInstance().express.setLogConfig({
            logLevel: "warn",
        });
        bindEventListeners(this.initEventHandler);
        if (config.mode === ZegoUIKitScenario.CALL_INVITATION) {
            const res = await InvitationService.getInstance().initZIM(appID, userID, userName, token);
            // 需判断 zim 是否登录成功
            zloginfo('init zim result', res);
            if(res) {
                this.invitationService = InvitationService.getInstance();
                InvitationService.getInstance().addCallInvitationListener(this.LISTENER_ID, {
                    onZIMTokenWillExpire: () => {
                        zloginfo('[UIKitCore]onZIMTokenWillExpire');
                        this.config.onTokenWillExpire && this.config.onTokenWillExpire(this.roomID);
                    }
                })
                return Promise.resolve(true);
            } else {
                return Promise.reject(false);
            };
        } else {
            // 仅初始化 rtc
            return Promise.resolve(true);
        }
    }

    public unInit() {
        if (this.mode === ZegoUIKitScenario.CALL_INVITATION) {
            InvitationService.getInstance().unInitZIM();
        }
    }

    public renewToken(token: string, roomID?: string): boolean {
        InvitationService.getInstance().renewToken(token);
        return UIKitCore.getInstance().express.renewToken(token, roomID);
    }

    // 创建 live-pusher 上下文 LivePusherContext 对象。
    public static createLivePusherContext() {
        zloginfo('[UIKitCore]createLivePusherContext');
        //@ts-ignore
        return wx.createLivePusherContext();
    }
    // 创建 live-player 上下文 LivePlayerContext 对象。建议使用 wx.createSelectorQuery 获取 context 对象。
    public static createLivePlayerContext(streamID: string) {
        zloginfo('[UIKitCore]createLivePlayerContext');
        //@ts-ignore
        return wx.createLivePlayerContext(streamID);
    }

    // 检测摄像头/麦克风权限
    public async authCheck(): Promise<boolean> {
        let result: {
            code: number;
            msg: string;
        }
        try {
            result = await UIKitCore.getInstance().express.checkSystemRequirements();
        } catch (error) {
            zlogerror("authCheck", error)
            // @ts-ignore
            wx.showModal({
                title: "提示",
                content: "检查权限出现错误，无法使用该功能，请联系技术支持寻求帮助。",
                showCancel: false
            })
            return false
        }
        zloginfo("checkSystemRequirements", result)
        return new Promise<boolean>((resolve) => {
            if (result && result.code === 10001) {
                zloginfo("result ", result.code)
                // @ts-ignore
                wx.showModal({
                    title: "提示",
                    content: "当前微信版本过低，无法使用该功能，请升级到最新微信版本后再试。",
                    showCancel: false
                })
                resolve(false)
            } else if (!result || result.code === 10002) {
                zloginfo("result ", result && result.code)
                // @ts-ignore
                const authorizeCameraRes = wx.authorize({
                    scope: "scope.camera",
                    success() {
                        zloginfo(`[UIKitCore]authorize camera success`)
                        return true;
                    },
                    fail(err: any) {
                        zloginfo('[UIKitCore]授权摄像头失败：', err)
                        return false;
                    }
                })

                // @ts-ignore
                const authorizeRecordRes = wx.authorize({
                    scope: "scope.record",
                    success() {
                        zloginfo(`[UIKitCore]authorize record success`)
                        return true;
                    },
                    fail(err: any) {
                        zloginfo('[UIKitCore]获取麦克风失败：', err)
                        return false;
                    }
                })
                if(authorizeCameraRes && authorizeRecordRes) {
                    resolve(true)
                } else {
                    resolve(false)
                }
            } else {
                resolve(true)
            }
        })
    }

    public async joinRoom(roomID: string, token: string, user: ZegoUIKitUser, roomConfig: any): Promise<boolean> {
        zloginfo('[UIKitCore]uikit core join room', roomID, token, user, roomConfig);
        zloginfo('[UIKitCore]joinroom userlist', this.userList);
        this.roomID = roomID;
        const expressConfig = {
            userUpdate: true,
            maxMemberCount: 0,
        }
        const result = await UIKitCore.getInstance().express.loginRoom(roomID, token, user, expressConfig);
        zloginfo('express login room', result)
        if (result) {
            try {
                // 登录房间成功
                // 开始推流
                const streamID = `${roomID}_${user.userID}_main`;
                const extraInfo = JSON.stringify({
                    isCameraOn: roomConfig.turnOnCameraWhenJoining,
                    isMicrophoneOn: roomConfig.turnOnMicrophoneWhenJoining,
                    hasVideo: true,
                    hasAudio: true,
                })
                const publishOption = { extraInfo };
                zlogwarning("[UIKitCore]joinRoom startPush", publishOption);
                const pusher = await startPush(streamID, publishOption);
                // 更新房间用户列表
                this.localUser = {
                    userID:user.userID,
                    userName:user.userName,
                    isCameraOn: roomConfig.turnOnCameraWhenJoining,
                    isMicrophoneOn: roomConfig.turnOnMicrophoneWhenJoining,
                    streamConfig: pusher,
                };
                this.userJoin(this.localUser);
                UIKitCore.getInstance().uikitListeners.notifyAllListener((uikitListeners)=>{
                    uikitListeners.onLocalUserUpdated?.(this.localUser);
                });
            } catch (err) {
               zlogerror('[UIKitCore]joinRoom error',err);
            }
        }
        return result
    }

    private userJoin(uiKitCoreUser: ZegoUIKitUser) {
        if (!this.containsUser(uiKitCoreUser.userID)) {
            zlogwarning('[UIKitCore]user join', uiKitCoreUser);
            this.userList.push(uiKitCoreUser);
            UIKitCore.getInstance().uikitListeners.notifyAllListener((uikitListeners)=>{
                uikitListeners.onUserListUpdated?.(this.userList);
            });
        }
    }

    public updateUser(user: ZegoUIKitUser) {
        this.userList.map((u: ZegoUIKitUser)=> {
            if(u.userID === user.userID) {
                zlogwarning('[UIKitCore]update user 存在相同userid')
                u = { ...user };
            }
        })
        zlogwarning('[UIKitCore]update user userlist', this.userList)
        UIKitCore.getInstance().uikitListeners.notifyAllListener((uikitListeners)=>{
            uikitListeners.onUserListUpdated?.(this.userList);
        });
    }

    private containsUser(userID: string): boolean {
        zloginfo('[UIKitCore]containsUser', this.userList);
        return this.userList.some((u: ZegoUser) => u.userID === userID);
    }

    private userLeave(uikitCoreUser: ZegoUser) {
        this.userList = this.userList.filter((u: ZegoUser) => u.userID !== uikitCoreUser.userID);
        UIKitCore.getInstance().uikitListeners.notifyAllListener((uikitListeners)=>{
            uikitListeners.onUserListUpdated?.(this.userList);
            uikitListeners.onUserLeaved?.(uikitCoreUser);
        });
    }

    // 外部判断是否是本地用户
    public isLocalUser(userID: string): boolean {
        zlogwarning('[UIKitCore]islocaluser', userID, this.localUser?.userID);
        if (this.localUser == null) {
            return false;
        }
        return userID === this.localUser.userID;
    }
    public getLocalUser(): ZegoUIKitUser | null {
        return this.localUser;
    }

    public logoutRoom() {
        zlogwarning('[UIKitCore]logoutRoom', this.localUser, this.roomID);
        // 停止推流
        try {
            this.localUser?.streamConfig.pusherContext.stop();
            stopPush(this.localUser?.streamConfig.streamID);
        } catch (error) {
            zlogerror('[UIKitCore]logoutRoom error', error)
        }
        // 清空userlist
        this.userList = [];
        if (this.mode === ZegoUIKitScenario.CALL_INVITATION) {
            this.invitationService.endInvitation();
        }
        return UIKitCore.getInstance().express.logoutRoom(this.roomID);
    }

    public addUIKitListener(listenerID: string, listener: ZegoUIKitListener) {
        this.uikitListeners.addListener(listenerID, listener);
    }

    public removeUIKitListener(listenerID: string) {
        this.uikitListeners.removeListener(listenerID);
    }
}
