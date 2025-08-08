const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);

const router = express.Router();

// WD My Cloud Home Configuration
const WD_DEVICE_IP = '192.168.1.112';
const WD_DEFAULT_SHARE = 'Public';
const WD_PRC_FOLDER = 'prc';

// User sessions storage
const userSessions = new Map();

// Multer configuration for file uploads
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 100 * 1024 * 1024, // 100MB per file
        files: 10 // Maximum 10 files
    },
    fileFilter: (req, file, cb) => {
        // Allowed file types
        const allowedTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'image/jpeg',
            'image/png',
            'image/gif',
            'text/plain'
        ];
        
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error(`Desteklenmeyen dosya türü: ${file.mimetype}`), false);
        }
    }
});

// Mevcut mount edilmiş drive'ları tespit etme fonksiyonu
async function detectExistingWDMount() {
    try {
        console.log('🔍 Mevcut WD My Cloud Home mount\'ları aranıyor...');
        
        // Windows'ta mevcut network drive'ları listele
        const { stdout } = await execAsync('net use');
        const lines = stdout.split('\n');
        
        for (const line of lines) {
            // MYCLOUD içeren satırları ara
            if (line.includes('MYCLOUD') || line.includes(WD_DEVICE_IP)) {
                const parts = line.trim().split(/\s+/);
                if (parts.length >= 2) {
                    const driveLetter = parts[1].replace(':', '');
                    const networkPath = parts[2];
                    
                    console.log(`✅ Mevcut WD mount bulundu: ${driveLetter}: -> ${networkPath}`);
                    
                    return {
                        success: true,
                        driveLetter: driveLetter,
                        networkPath: networkPath,
                        prcPath: `${driveLetter}:\\${WD_PRC_FOLDER}`
                    };
                }
            }
        }
        
        console.log('❌ Mevcut WD mount bulunamadı');
        return { success: false };
        
    } catch (error) {
        console.error('❌ Mount tespit hatası:', error);
        return { success: false, error: error.message };
    }
}

// Kullanılabilir drive letter bulma fonksiyonu
async function findAvailableDriveLetter() {
    try {
        // Mevcut drive'ları listele
        const { stdout } = await execAsync('wmic logicaldisk get size,freespace,caption');
        const usedDrives = stdout.match(/[A-Z]:/g) || [];
        
        // Z'den A'ya doğru kullanılabilir drive bul
        const driveLetters = 'ZYXWVUTSRQPONMLKJIHGFED'.split('');
        
        for (const letter of driveLetters) {
            if (!usedDrives.includes(`${letter}:`)) {
                console.log(`📁 Kullanılabilir drive bulundu: ${letter}:`);
                return letter;
            }
        }
        
        return null;
        
    } catch (error) {
        console.error('❌ Drive letter bulma hatası:', error);
        return 'Z'; // Fallback
    }
}

// PRC klasör yapısını oluşturma fonksiyonu
async function createPRCFolderStructure(prcPath) {
    try {
        console.log(`📁 PRC klasör yapısı oluşturuluyor: ${prcPath}`);
        
        // Ana PRC klasörü
        await fs.mkdir(prcPath, { recursive: true });
        console.log(`✅ PRC klasörü oluşturuldu: ${prcPath}`);
        
        // Alt klasörler
        const subFolders = [
            'talepler',
            'satinalma', 
            'lojistik',
            'sirket',
            'diger'
        ];
        
        for (const folder of subFolders) {
            const folderPath = path.join(prcPath, folder);
            await fs.mkdir(folderPath, { recursive: true });
            console.log(`✅ Alt klasör oluşturuldu: ${folder}`);
        }
        
        return true;
        
    } catch (error) {
        console.error('❌ PRC klasör oluşturma hatası:', error);
        return false;
    }
}

// Geliştirilmiş mount fonksiyonu - mevcut mount'u kullan
async function mountWDMyCloudHome(userId, username, password) {
    try {
        console.log(`🔐 WD My Cloud Home mount işlemi - Kullanıcı: ${userId}`);
        
        // Önce mevcut mount'u kontrol et
        const existingMount = await detectExistingWDMount();
        
        if (existingMount.success) {
            console.log(`✅ Mevcut mount kullanılıyor: ${existingMount.driveLetter}:`);
            
            // PRC klasörünü oluştur
            const prcPath = existingMount.prcPath;
            await createPRCFolderStructure(prcPath);
            
            // Session'ı kaydet
            userSessions.set(userId, {
                username: username,
                driveLetter: existingMount.driveLetter,
                mountPath: existingMount.networkPath,
                prcPath: prcPath,
                loginTime: new Date(),
                lastActivity: new Date(),
                usingExistingMount: true
            });
            
            return {
                success: true,
                driveLetter: existingMount.driveLetter,
                mountPath: existingMount.networkPath,
                prcPath: prcPath,
                method: 'existing_mount'
            };
        }
        
        // Mevcut mount yoksa yeni mount oluştur
        console.log('📁 Yeni mount oluşturuluyor...');
        
        // Kullanılabilir drive letter bul
        const availableDrive = await findAvailableDriveLetter();
        
        if (!availableDrive) {
            return {
                success: false,
                error: 'Kullanılabilir drive letter bulunamadı'
            };
        }
        
        console.log(`📁 Yeni mount işlemi başlatılıyor: ${availableDrive}:`);
        
        // Windows net use komutu
        const mountPath = `\\\\${WD_DEVICE_IP}\\${WD_DEFAULT_SHARE}`;
        const mountCommand = `net use ${availableDrive}: "${mountPath}" /user:${username} ${password} /persistent:no`;
        
        console.log(`🔧 Mount komutu: net use ${availableDrive}: "${mountPath}" /user:${username} ***`);
        
        try {
            const { stdout, stderr } = await execAsync(mountCommand);
            console.log(`✅ Yeni mount başarılı: ${stdout}`);
            
            // PRC klasörünü oluştur
            const prcPath = `${availableDrive}:\\${WD_PRC_FOLDER}`;
            await createPRCFolderStructure(prcPath);
            
            // Session'ı kaydet
            userSessions.set(userId, {
                username: username,
                driveLetter: availableDrive,
                mountPath: mountPath,
                prcPath: prcPath,
                loginTime: new Date(),
                lastActivity: new Date(),
                usingExistingMount: false
            });
            
            return {
                success: true,
                driveLetter: availableDrive,
                mountPath: mountPath,
                prcPath: prcPath,
                method: 'new_mount'
            };
            
        } catch (mountError) {
            console.error(`❌ Mount hatası: ${mountError.message}`);
            
            // Hata mesajını analiz et
            let errorMessage = 'Mount işlemi başarısız';
            if (mountError.message.includes('1326')) {
                errorMessage = 'Kullanıcı adı veya şifre hatalı';
            } else if (mountError.message.includes('53')) {
                errorMessage = 'Ağ yolu bulunamadı - WD My Cloud Home erişilebilir değil';
            } else if (mountError.message.includes('1219')) {
                errorMessage = 'Aynı kullanıcı ile birden fazla bağlantı mevcut';
            }
            
            return {
                success: false,
                error: errorMessage,
                details: mountError.message
            };
        }
        
    } catch (error) {
        console.error('❌ Mount fonksiyon hatası:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

// API Endpoints

// Test connection endpoint
router.get('/test-connection', async (req, res) => {
    try {
        console.log('🔍 WD My Cloud Home bağlantı testi: 192.168.1.112');
        
        const { stdout } = await execAsync(`ping -n 1 ${WD_DEVICE_IP}`);
        
        return res.json({
            success: true,
            message: 'WD My Cloud Home erişilebilir',
            data: {
                deviceIP: WD_DEVICE_IP,
                pingResult: stdout,
                timestamp: new Date().toISOString()
            }
        });
        
    } catch (error) {
        console.error('❌ Ping hatası:', error);
        return res.status(500).json({
            success: false,
            message: 'WD My Cloud Home erişilemez',
            error: error.message
        });
    }
});

// Status endpoint
router.get('/status', async (req, res) => {
    try {
        const { userId } = req.query;
        
        const response = {
            success: true,
            data: {
                system: {
                    deviceIP: WD_DEVICE_IP,
                    activeSessions: userSessions.size,
                    platform: 'win32',
                    lastCheck: new Date().toISOString()
                },
                user: null,
                config: {
                    deviceIP: WD_DEVICE_IP,
                    defaultShare: WD_DEFAULT_SHARE,
                    prcFolder: WD_PRC_FOLDER,
                    maxFileSize: '50MB'
                }
            }
        };
        
        if (userId && userSessions.has(userId)) {
            const session = userSessions.get(userId);
            response.data.user = {
                userId: userId,
                username: session.username,
                driveLetter: session.driveLetter,
                prcPath: session.prcPath,
                loginTime: session.loginTime,
                lastActivity: session.lastActivity,
                usingExistingMount: session.usingExistingMount
            };
        }
        
        return res.json(response);
        
    } catch (error) {
        console.error('❌ Status endpoint hatası:', error);
        return res.status(500).json({
            success: false,
            message: 'Status alınamadı',
            error: error.message
        });
    }
});

// GET metodu ile login endpoint'i (browser test için)
router.get('/login', async (req, res) => {
    try {
        const { userId, username, password } = req.query;
        
        if (!userId || !username || !password) {
            return res.status(400).json({
                success: false,
                message: 'userId, username ve password parametreleri gerekli',
                example: '/api/documents/login?userId=test&username=your_wd_username&password=your_wd_password'
            });
        }

        console.log(`🔐 WD My Cloud Home login denemesi - Kullanıcı: ${userId}`);
        console.log(`👤 WD Username: ${username}`);
        
        // WD My Cloud Home mount işlemi
        const mountResult = await mountWDMyCloudHome(userId, username, password);
        
        if (mountResult.success) {
            console.log(`✅ Mount başarılı: ${mountResult.driveLetter}`);
            console.log(`📁 PRC Path: ${mountResult.prcPath}`);
            
            return res.json({
                success: true,
                message: 'WD My Cloud Home başarıyla bağlandı',
                data: {
                    userId: userId,
                    driveInfo: {
                        driveLetter: mountResult.driveLetter,
                        prcPath: mountResult.prcPath,
                        mountPath: mountResult.mountPath,
                        method: mountResult.method
                    },
                    timestamp: new Date().toISOString()
                }
            });
        } else {
            console.log(`❌ Mount hatası: ${mountResult.error}`);
            
            return res.status(401).json({
                success: false,
                message: 'WD My Cloud Home bağlantı hatası',
                error: mountResult.error,
                troubleshooting: {
                    checkCredentials: 'Kullanıcı adı ve şifrenizi kontrol edin',
                    checkNetwork: 'Ağ bağlantınızı kontrol edin',
                    checkDevice: 'WD My Cloud Home cihazının açık olduğundan emin olun'
                }
            });
        }
        
    } catch (error) {
        console.error('❌ Login endpoint hatası:', error);
        return res.status(500).json({
            success: false,
            message: 'Sunucu hatası',
            error: error.message
        });
    }
});

// POST metodu ile login endpoint'i
router.post('/login', async (req, res) => {
    try {
        const { userId, username, password } = req.body;
        
        if (!userId || !username || !password) {
            return res.status(400).json({
                success: false,
                message: 'userId, username ve password alanları gerekli'
            });
        }

        console.log(`🔐 WD My Cloud Home login denemesi - Kullanıcı: ${userId}`);
        
        const mountResult = await mountWDMyCloudHome(userId, username, password);
        
        if (mountResult.success) {
            return res.json({
                success: true,
                message: 'WD My Cloud Home başarıyla bağlandı',
                data: {
                    userId: userId,
                    driveInfo: mountResult
                }
            });
        } else {
            return res.status(401).json({
                success: false,
                message: 'WD My Cloud Home bağlantı hatası',
                error: mountResult.error
            });
        }
        
    } catch (error) {
        console.error('❌ Login POST endpoint hatası:', error);
        return res.status(500).json({
            success: false,
            message: 'Sunucu hatası',
            error: error.message
        });
    }
});

// Logout endpoint
router.post('/logout', async (req, res) => {
    try {
        const { userId } = req.body;
        
        if (!userId) {
            return res.status(400).json({
                success: false,
                message: 'userId gerekli'
            });
        }
        
        if (userSessions.has(userId)) {
            const session = userSessions.get(userId);
            
            // Eğer yeni mount oluşturulmuşsa unmount yap
            if (!session.usingExistingMount) {
                try {
                    await execAsync(`net use ${session.driveLetter}: /delete /y`);
                    console.log(`✅ Drive unmount edildi: ${session.driveLetter}:`);
                } catch (unmountError) {
                    console.error('❌ Unmount hatası:', unmountError);
                }
            }
            
            userSessions.delete(userId);
            console.log(`✅ Kullanıcı çıkış yaptı: ${userId}`);
        }
        
        return res.json({
            success: true,
            message: 'Başarıyla çıkış yapıldı'
        });
        
    } catch (error) {
        console.error('❌ Logout endpoint hatası:', error);
        return res.status(500).json({
            success: false,
            message: 'Çıkış hatası',
            error: error.message
        });
    }
});

// File upload endpoint
router.post('/upload', upload.array('files'), async (req, res) => {
    try {
        const { userId, category = 'diger', companyId, requestNumber } = req.body;
        
        if (!userId) {
            return res.status(400).json({
                success: false,
                message: 'userId gerekli'
            });
        }
        
        if (!userSessions.has(userId)) {
            return res.status(401).json({
                success: false,
                message: 'Kullanıcı giriş yapmamış'
            });
        }
        
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Dosya seçilmedi'
            });
        }
        
        const session = userSessions.get(userId);
        const uploadResults = [];
        
        for (const file of req.files) {
            try {
                // Dosya yolu oluştur
                let targetPath = path.join(session.prcPath, category);
                
                if (companyId) {
                    targetPath = path.join(targetPath, `COMPANY_${companyId}`);
                }
                
                if (requestNumber) {
                    targetPath = path.join(targetPath, requestNumber);
                }
                
                // Klasör oluştur
                await fs.mkdir(targetPath, { recursive: true });
                
                // Dosya adını güvenli hale getir
                const safeFileName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
                const filePath = path.join(targetPath, safeFileName);
                
                // Dosyayı kaydet
                await fs.writeFile(filePath, file.buffer);
                
                uploadResults.push({
                    originalName: file.originalname,
                    savedName: safeFileName,
                    path: filePath,
                    size: file.size,
                    mimetype: file.mimetype
                });
                
                console.log(`✅ Dosya kaydedildi: ${filePath}`);
                
            } catch (fileError) {
                console.error(`❌ Dosya kaydetme hatası: ${file.originalname}`, fileError);
                uploadResults.push({
                    originalName: file.originalname,
                    error: fileError.message
                });
            }
        }
        
        // Session'ı güncelle
        session.lastActivity = new Date();
        
        return res.json({
            success: true,
            message: `${uploadResults.length} dosya işlendi`,
            data: {
                uploadResults: uploadResults,
                targetPath: path.join(session.prcPath, category)
            }
        });
        
    } catch (error) {
        console.error('❌ Upload endpoint hatası:', error);
        return res.status(500).json({
            success: false,
            message: 'Dosya yükleme hatası',
            error: error.message
        });
    }
});

// File list endpoint
router.get('/list', async (req, res) => {
    try {
        const { userId, category = '', path: subPath = '' } = req.query;
        
        if (!userId) {
            return res.status(400).json({
                success: false,
                message: 'userId gerekli'
            });
        }
        
        if (!userSessions.has(userId)) {
            return res.status(401).json({
                success: false,
                message: 'Kullanıcı giriş yapmamış'
            });
        }
        
        const session = userSessions.get(userId);
        let targetPath = session.prcPath;
        
        if (category) {
            targetPath = path.join(targetPath, category);
        }
        
        if (subPath) {
            targetPath = path.join(targetPath, subPath);
        }
        
        const items = await fs.readdir(targetPath, { withFileTypes: true });
        const fileList = [];
        
        for (const item of items) {
            const itemPath = path.join(targetPath, item.name);
            const stats = await fs.stat(itemPath);
            
            fileList.push({
                name: item.name,
                type: item.isDirectory() ? 'folder' : 'file',
                size: stats.size,
                modified: stats.mtime,
                path: itemPath
            });
        }
        
        return res.json({
            success: true,
            data: {
                currentPath: targetPath,
                items: fileList
            }
        });
        
    } catch (error) {
        console.error('❌ List endpoint hatası:', error);
        return res.status(500).json({
            success: false,
            message: 'Dosya listesi alınamadı',
            error: error.message
        });
    }
});

// Help endpoint
router.get('/help', (req, res) => {
    return res.json({
        success: true,
        message: 'WD My Cloud Home API Yardım',
        endpoints: {
            'GET /test-connection': 'WD My Cloud Home bağlantı testi',
            'GET /status': 'Sistem ve kullanıcı durumu',
            'GET /login': 'Kullanıcı girişi (browser test)',
            'POST /login': 'Kullanıcı girişi (JSON)',
            'POST /logout': 'Kullanıcı çıkışı',
            'POST /upload': 'Dosya yükleme',
            'GET /list': 'Dosya listesi',
            'GET /help': 'Bu yardım sayfası'
        },
        examples: {
            login: '/api/documents/login?userId=test&username=your_wd_username&password=your_wd_password',
            status: '/api/documents/status?userId=test',
            list: '/api/documents/list?userId=test&category=talepler'
        }
    });
});

// Initialize WD My Cloud Home system
console.log('🚀 WD My Cloud Home User Authentication System başlatıldı');
console.log(`📍 Device IP: ${WD_DEVICE_IP}`);
console.log(`📁 Default Share: ${WD_DEFAULT_SHARE}`);
console.log(`📁 PRC Folder: ${WD_PRC_FOLDER}`);

module.exports = router;

