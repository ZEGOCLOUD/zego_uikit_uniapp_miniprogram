
import { ZIM, ZIMSDK, ZIMEventHandler, ZIMError, 
    ZIMEventOfTokenWillExpireResult, 
    ZIMEventOfConnectionStateChangedResult, 
    ZIMEventOfCallUserStateChangedResult, 
    ZIMEventOfCallInvitationCreatedResult,
    ZIMEventOfCallInvitationReceivedResult,
    ZIMEventOfCallInvitationCancelledResult,
    ZIMEventOfCallInvitationTimeoutResult,
    
 } from 'zego-zim-miniprogram';
import { zloginfo, zlogwarning, zlogerror } from "../../../utils/logger";
import { ZegoUIKitUser, ZegoCallInvitationListener } from '../../defines';
import { NotifyList } from '../NotifyList';
export default class InvitationService {
    static instance: InvitationService;
    static getInstance(): InvitationService {
        if (!InvitationService.instance) {
            InvitationService.instance = new InvitationService();
        }
        return InvitationService.instance;
    }
    zrtcRoomID!: string;
    zim!: ZIMSDK;
    zimCallID!: string;
    userID!: string;
    userName!: string;
    token!: string;
    caller!: ZegoUIKitUser;

    private invitationListeners: NotifyList<ZegoCallInvitationListener> = new NotifyList();

    private zimEventListeners = {
        error(zim: ZIMSDK, errorInfo: ZIMError) {
            zlogwarning('zim error', zim, errorInfo);
        },
        tokenWillExpire(zim: ZIMSDK, data: ZIMEventOfTokenWillExpireResult){
            zlogwarning('zim tokenWillExpire', zim, data);
            InvitationService.getInstance().invitationListeners.notifyAllListener((invitationListeners)=>{
                invitationListeners.onZIMTokenWillExpire?.();
            })
        },
        connectionStateChanged(zim: ZIMSDK, data: ZIMEventOfConnectionStateChangedResult){
            zlogwarning('zim connectionStateChanged', zim, data);
        },
        callUserStateChanged(zim: ZIMSDK, data: ZIMEventOfCallUserStateChangedResult){
            zlogwarning('zim callUserStateChanged', zim, data, InvitationService.getInstance().zimCallID,  InvitationService.getInstance().caller);
            const { callID, callUserList } = data;
            // if (callID === InvitationService.getInstance().zimCallID) {
            callUserList.forEach((user)=>{
                const { extendedData, state, userID } = user;
                // 呼叫者处理逻辑
                if (InvitationService.getInstance().userID === InvitationService.getInstance().caller.userID) {
                    if (state === ZIM.CallUserState.Cancelled) {
                        // 呼叫者取消
                        InvitationService.getInstance().zimCallID = '';
                        InvitationService.getInstance().invitationListeners.notifyAllListener((invitationListeners)=>{
                            invitationListeners.onCallInvitationCancelled?.(InvitationService.getInstance().zrtcRoomID, InvitationService.getInstance().caller, extendedData);
                        })
                    }
                    if (userID === InvitationService.getInstance().userID) return;
                    if (state === ZIM.CallUserState.Accepted) {
                        // 接受呼叫邀请
                        zloginfo('zim state1');
                        if (InvitationService.getInstance().zimCallID) {
                            InvitationService.getInstance().invitationListeners.notifyAllListener((invitationListeners)=>{
                                invitationListeners.onCallInvitationAccepted?.(InvitationService.getInstance().zrtcRoomID, InvitationService.getInstance().caller.userID, userID);
                            });
                        }
                    }
                    if (state === ZIM.CallUserState.Rejected) {
                        if (InvitationService.getInstance().zimCallID) {
                            InvitationService.getInstance().invitationListeners.notifyAllListener((invitationListeners)=>{
                                invitationListeners.onCallInvitationRefused?.(InvitationService.getInstance().zrtcRoomID, InvitationService.getInstance().caller.userID, userID, extendedData);
                            })
                            InvitationService.getInstance().endInvitation();
                        }
                    }
                    if (state === ZIM.CallUserState.Timeout) {
                        // 超时
                        if (InvitationService.getInstance().zimCallID) {
                            InvitationService.getInstance().invitationListeners.notifyAllListener((invitationListeners)=>{
                                invitationListeners.onCallInvitationTimeoutofInviter?.(InvitationService.getInstance().zrtcRoomID, userID, extendedData);
                            })
                            InvitationService.getInstance().endInvitation();
                        }
                    }
                } else {
                    // 接收者
                    if (userID === InvitationService.getInstance().userID) {
                        if (state === ZIM.CallUserState.Accepted) {
                            InvitationService.getInstance().invitationListeners.notifyAllListener((invitationListeners)=>{
                                invitationListeners.onCallInvitationAccepted?.(InvitationService.getInstance().zrtcRoomID, InvitationService.getInstance().caller.userID, userID);
                            });
                        }
                        if (state === ZIM.CallUserState.Rejected) {
                            InvitationService.getInstance().invitationListeners.notifyAllListener((invitationListeners)=>{
                                invitationListeners.onCallInvitationRefused?.(InvitationService.getInstance().zrtcRoomID, InvitationService.getInstance().caller.userID, userID, extendedData);
                            })
                            InvitationService.getInstance().endInvitation();
                        }
                    }
                   
                }
            })
            // }
        },
        // 呼叫邀请创建通知
        callInvitationCreated(zim: ZIMSDK, data: ZIMEventOfCallInvitationCreatedResult) {
            zlogwarning('zim callInvitationCreated', data, InvitationService.getInstance().zimCallID);
            const { callID, extendedData } = data;
            InvitationService.getInstance().invitationListeners.notifyAllListener((invitationListeners)=>{
                invitationListeners.onCallInvitationCreated?.(InvitationService.getInstance().zrtcRoomID, extendedData);
            })
            if (!InvitationService.getInstance().zimCallID) {
                // 取消呼叫邀请
                // const extendedDataJson = JSON.parse(extendedData);
                // const callData = JSON.parse(extendedDataJson.data);
                // const { invitees, custom_data } = callData;
                // const inviteesIDList = invitees.map((u: any)=> u.user_id);
                // InvitationService.getInstance().zimCallID = callID;
                // InvitationService.getInstance().cancelInvitation(inviteesIDList, custom_data);
                // 通知prebuilt
                InvitationService.getInstance().zimCallID = callID;
            }
            // 断网时发起呼叫邀请，断网恢复后主叫会收到创建的回调，此时如果呼叫邀请界面未显示，则跳转呼叫邀请界面
        },
        // 收到呼叫邀请通知
        callInvitationReceived(zim: ZIMSDK, data: ZIMEventOfCallInvitationReceivedResult) {
            zlogwarning('zim callInvitationReceived', zim, data.callID, data.inviter, data.extendedData);
            zlogwarning('zim received', InvitationService.getInstance().zimCallID);
            const { callID, inviter, extendedData } = data;
            if (InvitationService.getInstance().zimCallID) {
                // 偶现收到两次同个callid的呼叫邀请，此时不能走到拒绝逻辑
                if (callID !== InvitationService.getInstance().zimCallID) {
                    const refuseExtendedData = {
                        reason: "busy"
                    }
                    InvitationService.getInstance().refuseInvitation(callID, JSON.stringify(refuseExtendedData));
                }
                return;
            } else {
                const extendedDataJson = JSON.parse(extendedData);
                const callData = JSON.parse(extendedDataJson.data);
                zlogwarning('zim callInvitationReceived', callData);
                InvitationService.getInstance().zrtcRoomID = callData.call_id;
                InvitationService.getInstance().zimCallID = callID;
                InvitationService.getInstance().caller = { userID: callData.inviter.id, userName: callData.inviter.name };
                // 通知prebuilt
                InvitationService.getInstance().invitationListeners.notifyAllListener((invitationListeners)=>{
                    invitationListeners.onCallInvitationReceived?.(InvitationService.getInstance().zrtcRoomID, extendedData);
                })
            }
        },
        // 收到取消呼叫通知
        callInvitationCancelled(zim: ZIMSDK, data: ZIMEventOfCallInvitationCancelledResult) {
            zlogwarning('zim callInvitationCancelled', zim, data);
            const { callID, mode, inviter, extendedData} = data;
            if(callID === InvitationService.getInstance().zimCallID) {
                InvitationService.getInstance().endInvitation();
                InvitationService.getInstance().invitationListeners.notifyAllListener((invitationListeners)=>{
                    invitationListeners.onCallInvitationCancelled?.(InvitationService.getInstance().zrtcRoomID, InvitationService.getInstance().caller, extendedData);
                })
            }
        },
        callInvitationTimeout(zim: ZIMSDK, data: ZIMEventOfCallInvitationTimeoutResult) {
            zlogwarning('zim callInvitationTimeout', zim, data);
            const { callID, mode } = data;
            if(callID === InvitationService.getInstance().zimCallID) {
                InvitationService.getInstance().zimCallID = '';
                InvitationService.getInstance().invitationListeners.notifyAllListener((invitationListeners)=>{
                    invitationListeners.onCallInvitationTimeoutofInvitee?.(InvitationService.getInstance().zrtcRoomID, InvitationService.getInstance().caller);
                })
            }
        }
    }
    public async initZIM(appID: number, userID: string, userName: string, token: string): Promise<boolean | undefined>{
        zlogwarning('init zim', userID, this.userID, token);
        if (!appID) {
            zlogwarning("未传appID");
            return false;
        }
        if (!userID) {
            zlogwarning("未传userID");
            return false;
        }
        if (this.zim && userID === this.userID) {
            zlogwarning("已存在 zim 实例");
            return false;
        }
        ZIM.create({ appID });
        this.zim = ZIM.getInstance();
        this.bindEventListeners(this.zimEventListeners as ZIMEventHandler);
        // 登录 zim
        this.userID = userID;
        this.userName = userName;
        this.token = token;
        // 返回登录结果，登录后才能调用呼叫邀请
        return this.login();
    }

    public async unInitZIM() {
        zlogwarning('uninit zim');
        await this.zim.logout();
        this.userID = "";
        this.userName = "";
        this.token = "";
        this.zim = null as any;
        this.zrtcRoomID = '';
        this.zimCallID = '';
        this.caller = {} as ZegoUIKitUser;
        // logout 和 destroy 同时使用，zim sdk 会报错
        // this.zim.destroy();
    }

    public async renewToken(token: string) {
        zloginfo('renewToken', token);
        if(!this.zim){
            zlogwarning('ZIM 未初始化, 不需要 renewToken');
            return
        }
        this.token = token;
        return this.zim.renewToken(token)
            .then(()=>{
                zloginfo('ZIM renewToken success');
                return Promise.resolve(true);
            })
            .catch((err)=>{
                zlogerror('ZIM renewToken failed', err);
                return Promise.reject(false);
            })
    }

    private async login(retryTime = 1){
        zlogwarning('login zim', retryTime);
        if (retryTime > 4) {
            zlogerror("登录zim失败！！, 重试次数:", retryTime);
			return;
        }
        return this.zim.login(this.userID, {userName: this.userName, token: this.token, isOfflineLogin: false})
            .then(() => {
                // 登录成功
                zloginfo(`登录zim成功,userID: ${this.userID}`);
                // this.zim.uploadLog();
                return Promise.resolve(true);
            })
            .catch((err: any) => {
                // 登录失败
                // @ts-ignore
                // uni.showToast({
                //     title: `${JSON.stringify(err)}`,
                //     duration: 5000
                // })
                zloginfo(`登录zim失败！！ userID1: ${this.userID}`);
                setTimeout(() => {
                    this.login(++retryTime);
                }, 2000 * retryTime);
                return Promise.reject(false);
            });
    }

    public logout () {
        return this.zim.logout();
    }
    
    public bindEventListeners(listeners: ZIMEventHandler) {
        for (let key of Object.keys(listeners)) {
            const evt = key as keyof ZIMEventHandler;
            this.zim.on(evt, listeners[evt]!)
        }
    }
    public sendInvitation(invitees: ZegoUIKitUser[], type: number, customData: string, timeout: number = 60, callID?: string) {
        // resourceID?: string
        // notificationTitle?: string
        // notificationMessage?: string
        zloginfo('[InvitationService]sendInvitation()', invitees, type, customData, timeout, callID);
        if (!invitees.length) { return Promise.reject({code: 100001, message: 'invitee 为空！'}) };
        if (invitees.length > 1) { return Promise.reject({code: 100003, message: '暂不支持呼叫多人'}) };
        if (this.zimCallID) { return Promise.reject({code: 100002, message: '已有呼叫邀请'})};

        const inviteesID = invitees.map((i) => i.userID);
        this.zrtcRoomID = callID || `call_${this.userID}_${new Date().getTime()}`;
        this.caller = { userID: this.userID, userName: this.userName };
        const data = {
            call_id: this.zrtcRoomID,
			invitees: invitees.map((u) => ({
				user_id: u.userID,
				user_name: u.userName,
			})),
			inviter: {
				id: this.userID,
				name: this.userName,
			},
			type,
			custom_data: customData,
        }
        const extendedData = {
			inviter_name: this.userName,
			type,
			data: JSON.stringify(data),
		};
        const config = {
            mode: 0,
            timeout,
            extendedData: JSON.stringify(extendedData),
            enableNotReceivedCheck: false,
        }
        zloginfo('[InvitationService]zim callInvite()', inviteesID, config);
        return this.zim.callInvite(inviteesID, config)
            .then(({ callID, timeout, errorUserList })=>{
                zloginfo(`发起呼叫邀请成功, callID: ${callID}, invitees: ${invitees}, errorUserList: ${errorUserList}`);
                // 保存callID
                this.zimCallID = callID;
                // 通知 prebuilt 跳转呼叫邀请等待页
                return Promise.resolve({ code: 0, callID: this.zrtcRoomID, timeout, errorUserList, customData }); 
            })
            .catch((err)=>{
                zloginfo(`发起呼叫邀请失败！！ invitees: ${invitees}, err:`, err);
                return Promise.reject({ code : err.code || 100003, message: err.message || 'zim 呼叫邀请失败！' });
            });
    }
   
    public cancelInvitation(inviteesIDList: string[], extendedData?: string) {
        zloginfo('取消呼叫邀请', this.zimCallID, inviteesIDList, extendedData);
        return this.zim.callCancel(inviteesIDList, this.zimCallID, {extendedData: extendedData!})
            .then((res)=>{
                zloginfo(`取消呼叫邀请成功, res:${res}, callID: ${this.zimCallID}, inviteesIDList: ${inviteesIDList}`);
                this.endInvitation();
                return Promise.resolve({ code: 0 });
            })
            .catch((err)=>{
                zlogerror(`取消呼叫邀请失败, err:${err}, callID: ${this.zimCallID}, inviteesIDList: ${inviteesIDList}`, err);
                // 取消失败同时对端接受，不能清空房间信息
                // this.endInvitation();
                return Promise.reject({code: err.code || 100004, message: err.message || '取消呼叫邀请失败'});
            });
    } 
    public acceptInvitation(callID: string, extendedData: string) {
        return this.zim.callAccept(this.zimCallID, {extendedData})
            .then((callID)=>{
                zloginfo(`接受呼叫邀请成功`, callID);
                return Promise.resolve({callID: this.zrtcRoomID });
            })
            .catch((err)=>{
                zlogerror(`接受呼叫邀请失败`, err);
                return Promise.reject({code: err.code || 100005, message: err.message || '接受呼叫邀请失败！'});
            })
    }
    public refuseInvitation(callID?: string, customData?: string) {
        const defaultExtenedData = {
            reason: 'decline'
        }
        return this.zim.callReject(callID || this.zimCallID, { extendedData: customData || JSON.stringify(defaultExtenedData) })
            .then((res)=>{
                zloginfo(`拒绝呼叫邀请成功, res:${res}, callID: ${this.zimCallID}`);
                // busy 拒绝不清除当前 callID
                !callID && (this.zimCallID = '');
                return Promise.resolve({callID: this.zrtcRoomID });
            })
            .catch((err)=>{
                zlogerror(`拒绝呼叫邀请失败, err:${err}, callID: ${this.zimCallID}`);
                return Promise.reject({code: err.code || 100006, message: err.message || '拒绝呼叫邀请失败'});
            })
    }

    public endInvitation() {
        // 清空 zim callID 和 rtc roomID
        this.zimCallID = '';
        this.zrtcRoomID = '';
    }

    public addCallInvitationListener(listenerID: string, listener: ZegoCallInvitationListener) {
        this.invitationListeners.addListener(listenerID, listener);
    }

    public removeCallInvitationListener(listenerID: string) {
        this.invitationListeners.removeListener(listenerID);
    }
}