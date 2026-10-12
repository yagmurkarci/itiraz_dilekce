const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const morgan = require('morgan');
const path = require('path');

// Çevre değişkenlerini route ve servisler yüklenmeden önce hazırla.
dotenv.config();

// Route'lar
const authRoutes = require('./src/backend/routes/auth.route');
const userRoutes = require('./src/backend/routes/users.route');
const roleRoutes = require('./src/backend/routes/roles.route');
const userRoleRoutes = require('./src/backend/routes/user-roles.route');
const endpointRoutes = require('./src/backend/routes/endpoints.route');
const endpointRoleRoutes = require('./src/backend/routes/endpoint-roles.route');
const departmentRoutes = require('./src/backend/routes/departments.route');
const courseRoutes = require('./src/backend/routes/courses.route');
const requestRoutes = require('./src/backend/routes/requests.route');
const requestAttachmentRoutes = require('./src/backend/routes/request-attachments.route');
const courseInstructorRoutes = require('./src/backend/routes/course-instructors.route');
const bysRoutes = require('./src/backend/routes/bys.route');


const app = express();

// CORS (Cross-Origin Resource Sharing) izinlerini ekliyoruz
app.use(cors());

// Request Body'nin JSON formatında olmasını sağlıyoruz
app.use(express.json());

// HTTP isteği loglaması için morgan kullanıyoruz
app.use(morgan('dev'));

app.use(express.static(path.join(__dirname, 'public')));

// Route'ları kullanıyoruz
app.use('/api/auth', authRoutes); // Auth işlemleri
app.use('/api/users', userRoutes); // Users işlemleri
app.use('/api/roles', roleRoutes); // Roles işlemleri
app.use('/api/user-roles', userRoleRoutes); // User-Roles işlemleri
app.use('/api/endpoints', endpointRoutes);
app.use('/api/endpoint-roles', endpointRoleRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/request-attachments', requestAttachmentRoutes);
app.use('/api/course-instructors', courseInstructorRoutes);
app.use('/api/bys', bysRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});