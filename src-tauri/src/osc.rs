use rosc::{OscMessage, OscPacket, OscType};
use std::net::{UdpSocket, SocketAddr};
use std::sync::Mutex;

/// VRChat OSC 客户端
pub struct OscClient {
    socket: UdpSocket,
    target_addr: SocketAddr,
}

impl OscClient {
    /// 创建新的 OSC 客户端
    /// VRChat 默认监听 127.0.0.1:9000
    pub fn new() -> Result<Self, std::io::Error> {
        let socket = UdpSocket::bind("0.0.0.0:0")?;
        let target_addr = "127.0.0.1:9000".parse().unwrap();

        Ok(OscClient {
            socket,
            target_addr,
        })
    }

    /// 发送消息到 VRChat chatbox
    ///
    /// # 参数
    /// * `message` - 要发送的文本（最多 144 字符）
    /// * `send_immediately` - true: 立即发送, false: 仅显示预览
    pub fn send_chatbox_message(&self, message: &str, send_immediately: bool) -> Result<(), String> {
        // 限制消息长度为 144 字符
        let truncated = if message.len() > 144 {
            &message[..144]
        } else {
            message
        };

        let msg = OscMessage {
            addr: "/chatbox/input".to_string(),
            args: vec![
                OscType::String(truncated.to_string()),
                OscType::Bool(send_immediately),
            ],
        };

        let packet = OscPacket::Message(msg);
        let buf = rosc::encoder::encode(&packet)
            .map_err(|e| format!("Failed to encode OSC message: {}", e))?;

        self.socket.send_to(&buf, self.target_addr)
            .map_err(|e| format!("Failed to send OSC message: {}", e))?;

        Ok(())
    }

    /// 设置打字指示器状态
    ///
    /// # 参数
    /// * `typing` - true: 显示打字中, false: 隐藏
    pub fn set_typing_indicator(&self, typing: bool) -> Result<(), String> {
        let msg = OscMessage {
            addr: "/chatbox/typing".to_string(),
            args: vec![OscType::Bool(typing)],
        };

        let packet = OscPacket::Message(msg);
        let buf = rosc::encoder::encode(&packet)
            .map_err(|e| format!("Failed to encode OSC message: {}", e))?;

        self.socket.send_to(&buf, self.target_addr)
            .map_err(|e| format!("Failed to send OSC message: {}", e))?;

        Ok(())
    }

    /// 更新目标地址和端口
    pub fn set_target(&mut self, host: &str, port: u16) -> Result<(), String> {
        let addr = format!("{}:{}", host, port);
        self.target_addr = addr.parse()
            .map_err(|e| format!("Invalid address: {}", e))?;
        Ok(())
    }
}

/// 全局 OSC 客户端实例
pub struct OscManager {
    client: Mutex<Option<OscClient>>,
}

impl OscManager {
    pub fn new() -> Self {
        OscManager {
            client: Mutex::new(None),
        }
    }

    /// 初始化 OSC 客户端
    pub fn init(&self) -> Result<(), String> {
        let client = OscClient::new()
            .map_err(|e| format!("Failed to create OSC client: {}", e))?;

        let mut lock = self.client.lock().unwrap();
        *lock = Some(client);

        Ok(())
    }

    /// 发送 chatbox 消息
    pub fn send_message(&self, message: &str, send_immediately: bool) -> Result<(), String> {
        let lock = self.client.lock().unwrap();

        match lock.as_ref() {
            Some(client) => client.send_chatbox_message(message, send_immediately),
            None => Err("OSC client not initialized".to_string()),
        }
    }

    /// 设置打字指示器
    pub fn set_typing(&self, typing: bool) -> Result<(), String> {
        let lock = self.client.lock().unwrap();

        match lock.as_ref() {
            Some(client) => client.set_typing_indicator(typing),
            None => Err("OSC client not initialized".to_string()),
        }
    }
}
