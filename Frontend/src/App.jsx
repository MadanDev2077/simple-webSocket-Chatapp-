import { useEffect, useState, useCallback } from "react";
import "./App.css";
import { w3cwebsocket } from "websocket";
import { Avatar, Card, Input, message, Typography } from "antd";
import "antd/dist/reset.css";

const { Search } = Input;
const { Text } = Typography;
const { Meta } = Card;

function App() {
  const [user, setUser] = useState({
    userName: "",
    isLoggedIn: false,
    messages: [],
  });
  const [searchVal, setSearchVal] = useState("");
  const [client, setClient] = useState(null);

  useEffect(() => {
    const newClient = new w3cwebsocket("ws://127.0.0.1:8000");
    setClient(newClient);

    newClient.onopen = () => {
      console.log("WebSocket Client Connected");
    };

    newClient.onmessage = (message) => {
      const dataFromServer = JSON.parse(message.data);
      console.log("Got reply: ", dataFromServer);
      if (dataFromServer.type === "message") {
        setUser((prevUser) => ({
          ...prevUser,
          messages: [
            ...prevUser.messages,
            { msg: dataFromServer.msg, user: dataFromServer.user },
          ],
        }));
      }
    };

    return () => {
      newClient.close();
    };
  }, []);

  const sendMessage = useCallback(
    (value) => {
      if (client) {
        client.send(
          JSON.stringify({
            type: "message",
            msg: value,
            user: user.userName,
          })
        );
      }
      setSearchVal("");
    },
    [client, user.userName]
  );

  const handleLogin = useCallback((value) => {
    setUser((prevUser) => ({
      ...prevUser,
      isLoggedIn: true,
      userName: value,
    }));
  }, []);

  return (
    <div className="main">
      {user.isLoggedIn ? (
        <>
          <div className="title">
            <Text type="secondary" style={{ fontSize: "36px" }}>
              Message
            </Text>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              paddingBottom: 50,
            }}
          >
            {user.messages.map((message, index) => (
              <Card
                key={message.msg}
                style={{
                  width: 300,
                  margin: "16px 4px 0 4px",
                  alignSelf:
                    user.userName === message.user ? "flex-end" : "self-start",
                }}
              >
                <Meta
                  avatar={
                    <Avatar
                      style={{ color: "#56a00", backgroundColor: "#fde3cf" }}
                    >
                      {message.user[0].toUpperCase()}
                    </Avatar>
                  }
                  title={message.user}
                  description={message.msg}
                />
              </Card>
            ))}
          </div>
          <div className="bottom">
            <Search
              placeholder="input message and send"
              enterButton="Send"
              value={searchVal}
              size="large"
              onChange={(e) => setSearchVal(e.target.value)}
              onSearch={(value) => sendMessage(value)}
            />
          </div>
        </>
      ) : (
        <div style={{ padding: "200px 40px" }}>
          <Search
            placeholder="Enter Username"
            enterButton="Login"
            size="large"
            onSearch={handleLogin}
          />
        </div>
      )}
    </div>
  );
}

export default App;
