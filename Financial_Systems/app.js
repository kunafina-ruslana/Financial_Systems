const express = require('express');
const session = require('express-session');
const path = require('path');
const { sequelize } = require('./models/bd');
const routes = require('./routes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false
}));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use('/', routes);

app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).render('error', { 
        error: 'Внутренняя ошибка сервера',
        username: req.session.username 
    });
});

app.use((req, res) => {
    res.status(404).render('error', { 
        error: 'Страница не найдена',
        username: req.session.username 
    });
});

async function initializeDatabase() {
    try {
        await sequelize.authenticate();
        console.log('Database connection established successfully.');
        
        await sequelize.sync({ force: false });
        console.log('Database synchronized.');
        
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
            console.log(`Visit: http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
}

initializeDatabase();
