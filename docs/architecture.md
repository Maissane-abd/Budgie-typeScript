## Architecture générale

### **1 Structure du projet**
```
root/
├── backend/
│   ├── node_modules/
│   ├── src/
│   │   └── app.js
│   ├── dockerfile
│   ├── package-lock.json
│   └── package.json
├── db/
│   └── init.sql
├── frontend/
│   ├── app/
│   │   ├── .vscode/
│   │   ├── public/
│   │   ├── src/
│   │   │   ├── assets/
│   │   │   ├── components/
│   │   │   ├── App.vue
│   │   │   └── main.js
│   │   ├── .gitignore
│   │   ├── idex.html
│   │   ├── jsconfig.json
│   │   ├── package.json
│   │   └── vite.config.js
│   └── Dockerfile
├── nginx/
│   └── default.conf
├── .gitignore
├── README.md
├── docker-compose.yml
└── docs/
    ├── architecture.md
    ├── api-endpoints.md
    ├── setup.md
    └── workflow.md

```

### **2 Technologies utilisées**
- **Backend** : Node.js / Express  
- **Frontend** : Vue.js  
- **Base de données** : MySQL  
- **Conteneurisation** : Docker + docker-compose  
- **Déploiement** : (à définir : VPS, Render, Railway, etc.)