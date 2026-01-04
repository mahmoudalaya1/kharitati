<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">
<title>Chat Friends</title>
<meta name="viewport" content="width=device-width, initial-scale=1.0">

<style>
body{margin:0;font-family:Arial;background:#ece5dd}
.login,.chat{display:none;height:100vh}
.login{display:flex;align-items:center;justify-content:center}
.box{background:#fff;padding:20px;border-radius:10px}
.chat{display:flex}
.sidebar{width:30%;background:#fff;border-left:1px solid #ccc}
.messages{flex:1;display:flex;flex-direction:column}
.header{background:#075e54;color:#fff;padding:10px}
.list div{padding:10px;cursor:pointer;border-bottom:1px solid #eee}
.msgs{flex:1;padding:10px;overflow:auto}
.msg{background:#dcf8c6;margin:5px;padding:8px;border-radius:6px}
input,button{padding:10px;width:100%;margin-top:8px}
button{background:#25d366;color:#fff;border:none;cursor:pointer}
</style>

<!-- Firebase -->
<script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-auth-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore-compat.js"></script>

<script>
const firebaseConfig = {
  apiKey: "AIzaSyDr5hQl0t0eI0AYI7--xLZFYpFw8F6vXRA",
  authDomain: "kharitati-5cb37.firebaseapp.com",
  projectId: "kharitati-5cb37",
  storageBucket: "kharitati-5cb37.appspot.com",
  messagingSenderId: "296218682746",
  appId: "1:296218682746:web:e097a1279383dd02eea2c3"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
</script>
</head>

<body>

<div class="login" id="loginBox">
  <div class="box">
    <h3>تسجيل / دخول</h3>
    <input id="email" placeholder="email">
    <input id="pass" type="password" placeholder="password">
    <input id="username" placeholder="اسم المستخدم (للتسجيل فقط)">
    <button id="loginBtn">دخول / تسجيل</button>
  </div>
</div>

<div class="chat" id="chatBox">
  <h2 style="padding:20px">🎉 تم تسجيل الدخول</h2>
</div>

<script>
document.getElementById("loginBox").style.display="flex";

document.getElementById("loginBtn").addEventListener("click", ()=>{

  alert("✔ الزر انضغط"); // تأكيد 100%

  const email = document.getElementById("email").value;
  const pass = document.getElementById("pass").value;
  const username = document.getElementById("username").value;

  if(!email || !pass){
    alert("اكتب الإيميل وكلمة المرور");
    return;
  }

  auth.signInWithEmailAndPassword(email, pass)
  .then(()=>{
    document.getElementById("loginBox").style.display="none";
    document.getElementById("chatBox").style.display="block";
  })
  .catch(()=>{
    if(!username){
      alert("اكتب اسم المستخدم للتسجيل");
      return;
    }
    auth.createUserWithEmailAndPassword(email, pass)
    .then(()=>{
      document.getElementById("loginBox").style.display="none";
      document.getElementById("chatBox").style.display="block";
    })
    .catch(e=>alert(e.message));
  });

});
</script>

</body>
</html>
