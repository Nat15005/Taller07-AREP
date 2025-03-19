const API_BASE_URL = "http://localhost:8081";

const firebaseConfig = {
  apiKey: "AIzaSyD04aBntsWMTHr7g3nSL26bS8XTV0fZwhg",
  authDomain: "taller7arep.firebaseapp.com",
  projectId: "taller7arep",
  storageBucket: "taller7arep.firebasestorage.app",
  messagingSenderId: "575114387466",
  appId: "1:575114387466:web:e4cb42065ecb2c40543ff3",
  measurementId: "G-3N1HSNH0MD"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

function loginWithGoogle() {
  const provider = new firebase.auth.GoogleAuthProvider();
  auth.signInWithPopup(provider)
    .then((result) => {
      console.log("Usuario autenticado:", result.user);

      result.user.getIdToken().then((token) => {
        localStorage.setItem("firebaseToken", token);
        localStorage.setItem("userId", result.user.uid);
        localStorage.setItem("email", result.user.email);
        alert(`Bienvenido, ${result.user.email}!`);
        window.location.href = "home.html";
      });
    })
    .catch((error) => {
      console.error("Error en login:", error);
      alert("Hubo un problema al iniciar sesión con Google.");
    });
}

function registerWithEmail() {
  const email = document.querySelector("#reg-email").value.trim();
  const password = document.querySelector("#reg-password").value.trim();

  if (!email || !password) {
    alert("Por favor, completa todos los campos.");
    return;
  }

  if (password.length < 6) {
    alert("La contraseña debe tener al menos 6 caracteres.");
    return;
  }

  // Generar un username automáticamente si no se proporciona
  const username = email.split("@")[0]; // Usar la parte antes del @ como username

  // Crear usuario en Firebase
  auth.createUserWithEmailAndPassword(email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      localStorage.setItem("email", user.email);

      // Crear usuario en el backend
      fetch(`${API_BASE_URL}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email, username: username }), // Enviar email y username
      })
      .then(response => {
        if (!response.ok) {
          throw new Error("Error al crear usuario en el backend");
        }
        return response.json();
      })
      .then(data => {
        localStorage.setItem("userId", data.id); // Guardar el ID del usuario en localStorage
        alert("Usuario registrado correctamente.");
        window.location.href = "home.html"; // Redirigir a la página principal
      })
      .catch(error => {
        console.error("Error al crear usuario en el backend:", error);
        alert("Hubo un problema al registrar el usuario en el backend.");
      });
    })
    .catch((error) => {
      console.error("Error al registrar usuario en Firebase:", error);
      alert("Hubo un problema al registrar el usuario en Firebase.");
    });
}

function loginWithEmail() {
  const email = document.querySelector("#email").value.trim();
  const password = document.querySelector("#password").value.trim();

  if (!email || !password) {
    alert("Por favor, ingresa un correo electrónico y una contraseña.");
    return;
  }

  // Autenticar usuario en Firebase
  auth.signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      localStorage.setItem("email", user.email);

      // Obtener usuario del backend
      fetch(`${API_BASE_URL}/users/email/${user.email}`)
        .then(response => {
          if (!response.ok) {
            throw new Error("Error al obtener usuario del backend");
          }
          return response.json();
        })
        .then(data => {
          localStorage.setItem("userId", data.id); // Guardar el ID del usuario en localStorage
          alert("Inicio de sesión exitoso.");
          window.location.href = "home.html"; // Redirigir a la página principal
        })
        .catch(error => {
          console.error("Error al obtener usuario del backend:", error);
          alert("Hubo un problema al obtener la información del usuario.");
        });
    })
    .catch((error) => {
      console.error("Error al iniciar sesión en Firebase:", error);
      alert("Hubo un problema al iniciar sesión.");
    });
}

document.addEventListener("DOMContentLoaded", () => {
  const registerBtn = document.querySelector(".register-btn");
  const loginBtn = document.querySelector(".login-btn");
  const googleBtn = document.querySelector(".google-btn");

  if (registerBtn) {
    registerBtn.addEventListener("click", registerWithEmail);
  }

  if (loginBtn) {
    loginBtn.addEventListener("click", loginWithEmail);
  }

  if (googleBtn) {
    googleBtn.addEventListener("click", loginWithGoogle);
  }
});