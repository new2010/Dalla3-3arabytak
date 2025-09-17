/**
 * دلع عربيتك - Google Apps Script Backend
 * Car Accessories Store Backend API
 * 
 * Required Script Properties:
 * - SHEET_ID: Google Sheets ID containing Products and Orders sheets
 * - ADMIN_KEY: Secret admin key for admin operations
 */

// Main GET handler
function doGet(e) {
    try {
        const action = e.parameter.action;
        
        switch (action) {
            case 'products':
                return handleGetProducts();
            case 'product':
                return handleGetProduct(e.parameter.id);
            case 'orders':
                return handleGetOrders(e.parameter.adminKey);
            default:
                return createJsonResponse({ error: 'Invalid action' }, 400);
        }
    } catch (error) {
        console.error('doGet Error:', error);
        return createJsonResponse({ error: 'Server error' }, 500);
    }
}

// Main POST handler
function doPost(e) {
    try {
        const data = JSON.parse(e.postData.contents);
        const action = data.action || e.parameter.action;
        
        switch (action) {
            case 'order':
                return handleCreateOrder(data);
            case 'addProduct':
                return handleAddProduct(data);
            case 'updateProduct':
                return handleUpdateProduct(data);
            case 'deleteProduct':
                return handleDeleteProduct(data);
            case 'updateOrderStatus':
                return handleUpdateOrderStatus(data);
            default:
                return createJsonResponse({ error: 'Invalid action' }, 400);
        }
    } catch (error) {
        console.error('doPost Error:', error);
        return createJsonResponse({ error: 'Server error' }, 500);
    }
}

// Get all products
function handleGetProducts() {
    try {
        const products = getSheetData('Products');
        return createJsonResponse(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        return createJsonResponse({ error: 'Failed to fetch products' }, 500);
    }
}

// Get single product
function handleGetProduct(productId) {
    try {
        if (!productId) {
            return createJsonResponse({ error: 'Product ID is required' }, 400);
        }
        
        const products = getSheetData('Products');
        const product = products.find(p => p.id === productId);
        
        if (!product) {
            return createJsonResponse({ error: 'Product not found' }, 404);
        }
        
        return createJsonResponse(product);
    } catch (error) {
        console.error('Error fetching product:', error);
        return createJsonResponse({ error: 'Failed to fetch product' }, 500);
    }
}

// Get all orders (admin only)
function handleGetOrders(adminKey) {
    try {
        if (!validateAdminKey(adminKey)) {
            return createJsonResponse({ error: 'Unauthorized' }, 401);
        }
        
        const orders = getSheetData('Orders');
        return createJsonResponse(orders);
    } catch (error) {
        console.error('Error fetching orders:', error);
        return createJsonResponse({ error: 'Failed to fetch orders' }, 500);
    }
}

// Create new order
function handleCreateOrder(data) {
    try {
        // Validate required fields
        const requiredFields = ['customer_name', 'phone', 'address', 'items', 'subtotal', 'shipping', 'total'];
        const missingFields = requiredFields.filter(field => !data[field]);
        
        if (missingFields.length > 0) {
            return createJsonResponse({ 
                error: `Missing required fields: ${missingFields.join(', ')}` 
            }, 400);
        }
        
        // Validate items array
        if (!Array.isArray(data.items) || data.items.length === 0) {
            return createJsonResponse({ error: 'Items array is required and must not be empty' }, 400);
        }
        
        // Generate order ID
        const orderId = generateOrderId();
        const timestamp = new Date().toISOString();
        
        // Prepare order data for sheet
        const orderRow = [
            orderId,
            data.customer_name,
            data.phone,
            data.address,
            JSON.stringify(data.items),
            data.subtotal,
            data.shipping,
            data.total,
            'معلق', // Default status
            timestamp
        ];
        
        // Add to Orders sheet
        appendRowToSheet('Orders', orderRow);
        
        return createJsonResponse({
            success: true,
            order_id: orderId,
            message: 'Order created successfully'
        });
        
    } catch (error) {
        console.error('Error creating order:', error);
        return createJsonResponse({ error: 'Failed to create order' }, 500);
    }
}

// Add new product (admin only)
function handleAddProduct(data) {
    try {
        if (!validateAdminKey(data.adminKey)) {
            return createJsonResponse({ error: 'Unauthorized' }, 401);
        }
        
        // Validate required fields
        const requiredFields = ['name', 'price'];
        const missingFields = requiredFields.filter(field => !data[field]);
        
        if (missingFields.length > 0) {
            return createJsonResponse({ 
                error: `Missing required fields: ${missingFields.join(', ')}` 
            }, 400);
        }
        
        // Generate product ID
        const productId = generateProductId();
        const timestamp = new Date().toISOString();
        
        // Prepare product data for sheet
        const productRow = [
            productId,
            data.name,
            data.image_desc || '',
            data.short_desc || '',
            data.long_desc || '',
            data.price,
            data.stock || 0,
            data.category || '',
            data.tags || '',
            data.featured || false,
            timestamp
        ];
        
        // Add to Products sheet
        appendRowToSheet('Products', productRow);
        
        return createJsonResponse({
            success: true,
            product_id: productId,
            message: 'Product added successfully'
        });
        
    } catch (error) {
        console.error('Error adding product:', error);
        return createJsonResponse({ error: 'Failed to add product' }, 500);
    }
}

// Update existing product (admin only)
function handleUpdateProduct(data) {
    try {
        if (!validateAdminKey(data.adminKey)) {
            return createJsonResponse({ error: 'Unauthorized' }, 401);
        }
        
        if (!data.id) {
            return createJsonResponse({ error: 'Product ID is required' }, 400);
        }
        
        const sheet = getSheet('Products');
        const headers = getSheetHeaders(sheet);
        const rows = sheet.getDataRange().getValues();
        
        // Find the product row
        let rowIndex = -1;
        for (let i = 1; i < rows.length; i++) {
            if (rows[i][0] === data.id) {
                rowIndex = i + 1; // Sheet rows are 1-based
                break;
            }
        }
        
        if (rowIndex === -1) {
            return createJsonResponse({ error: 'Product not found' }, 404);
        }
        
        // Update the row
        const updatedRow = [...rows[rowIndex - 1]]; // Copy existing row
        
        // Update fields
        if (data.name !== undefined) updatedRow[1] = data.name;
        if (data.image_desc !== undefined) updatedRow[2] = data.image_desc;
        if (data.short_desc !== undefined) updatedRow[3] = data.short_desc;
        if (data.long_desc !== undefined) updatedRow[4] = data.long_desc;
        if (data.price !== undefined) updatedRow[5] = data.price;
        if (data.stock !== undefined) updatedRow[6] = data.stock;
        if (data.category !== undefined) updatedRow[7] = data.category;
        if (data.tags !== undefined) updatedRow[8] = data.tags;
        if (data.featured !== undefined) updatedRow[9] = data.featured;
        
        // Write the updated row back to the sheet
        sheet.getRange(rowIndex, 1, 1, updatedRow.length).setValues([updatedRow]);
        
        return createJsonResponse({
            success: true,
            message: 'Product updated successfully'
        });
        
    } catch (error) {
        console.error('Error updating product:', error);
        return createJsonResponse({ error: 'Failed to update product' }, 500);
    }
}

// Delete product (admin only)
function handleDeleteProduct(data) {
    try {
        if (!validateAdminKey(data.adminKey)) {
            return createJsonResponse({ error: 'Unauthorized' }, 401);
        }
        
        if (!data.id) {
            return createJsonResponse({ error: 'Product ID is required' }, 400);
        }
        
        const sheet = getSheet('Products');
        const rows = sheet.getDataRange().getValues();
        
        // Find the product row
        let rowIndex = -1;
        for (let i = 1; i < rows.length; i++) {
            if (rows[i][0] === data.id) {
                rowIndex = i + 1; // Sheet rows are 1-based
                break;
            }
        }
        
        if (rowIndex === -1) {
            return createJsonResponse({ error: 'Product not found' }, 404);
        }
        
        // Delete the row
        sheet.deleteRow(rowIndex);
        
        return createJsonResponse({
            success: true,
            message: 'Product deleted successfully'
        });
        
    } catch (error) {
        console.error('Error deleting product:', error);
        return createJsonResponse({ error: 'Failed to delete product' }, 500);
    }
}

// Update order status (admin only)
function handleUpdateOrderStatus(data) {
    try {
        if (!validateAdminKey(data.adminKey)) {
            return createJsonResponse({ error: 'Unauthorized' }, 401);
        }
        
        if (!data.order_id || !data.status) {
            return createJsonResponse({ error: 'Order ID and status are required' }, 400);
        }
        
        const sheet = getSheet('Orders');
        const rows = sheet.getDataRange().getValues();
        
        // Find the order row
        let rowIndex = -1;
        for (let i = 1; i < rows.length; i++) {
            if (rows[i][0] === data.order_id) {
                rowIndex = i + 1; // Sheet rows are 1-based
                break;
            }
        }
        
        if (rowIndex === -1) {
            return createJsonResponse({ error: 'Order not found' }, 404);
        }
        
        // Update the status (column 9, index 8)
        sheet.getRange(rowIndex, 9).setValue(data.status);
        
        return createJsonResponse({
            success: true,
            message: 'Order status updated successfully'
        });
        
    } catch (error) {
        console.error('Error updating order status:', error);
        return createJsonResponse({ error: 'Failed to update order status' }, 500);
    }
}

// Helper Functions

// Get sheet by name
function getSheet(sheetName) {
    const sheetId = PropertiesService.getScriptProperties().getProperty('SHEET_ID');
    if (!sheetId) {
        throw new Error('SHEET_ID not configured in Script Properties');
    }
    
    const spreadsheet = SpreadsheetApp.openById(sheetId);
    const sheet = spreadsheet.getSheetByName(sheetName);
    
    if (!sheet) {
        throw new Error(`Sheet "${sheetName}" not found`);
    }
    
    return sheet;
}

// Get sheet headers
function getSheetHeaders(sheet) {
    return sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
}

// Convert sheet data to JSON array
function getSheetData(sheetName) {
    const sheet = getSheet(sheetName);
    const headers = getSheetHeaders(sheet);
    const rows = sheet.getDataRange().getValues();
    
    const data = [];
    
    // Start from row 2 (index 1) to skip headers
    for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        const obj = {};
        
        headers.forEach((header, index) => {
            obj[header] = row[index];
        });
        
        data.push(obj);
    }
    
    return data;
}

// Append row to sheet
function appendRowToSheet(sheetName, rowData) {
    const sheet = getSheet(sheetName);
    sheet.appendRow(rowData);
}

// Validate admin key
function validateAdminKey(providedKey) {
    const adminKey = PropertiesService.getScriptProperties().getProperty('ADMIN_KEY');
    return adminKey && providedKey === adminKey;
}

// Generate unique product ID
function generateProductId() {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `P-${timestamp}-${random}`;
}

// Generate unique order ID
function generateOrderId() {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `O-${timestamp}-${random}`;
}

// Create JSON response
function createJsonResponse(data, status = 200) {
    const response = ContentService.createTextOutput(JSON.stringify(data));
    response.setMimeType(ContentService.MimeType.JSON);
    
    if (status !== 200) {
        // Note: Apps Script doesn't support custom HTTP status codes in responses
        // Status is included for documentation and potential future use
        data._status = status;
    }
    
    return response;
}

// Initialize sample data (run this once manually if needed)
function initializeSampleData() {
    try {
        // Add sample products
        const sampleProducts = [
            {
                name: 'طقم دواسات جلد فاخر',
                image_desc: 'صورة طقم دواسات من الجلد الطبيعي الأسود مع خياطة حمراء أنيقة',
                short_desc: 'طقم دواسات من الجلد الطبيعي عالي الجودة',
                long_desc: 'طقم دواسات مصنوع من أجود أنواع الجلد الطبيعي، يتميز بالراحة والأناقة. مناسب لجميع أنواع السيارات ويضيف لمسة فاخرة للمقصورة الداخلية.',
                price: 299,
                stock: 25,
                category: 'إكسسوارات داخلية',
                tags: 'جلد، دواسات، فاخر، راحة',
                featured: true
            },
            {
                name: 'مساند رأس مطرزة',
                image_desc: 'صورة مساند رأس مطرزة بخيوط ذهبية على قماش أسود فاخر',
                short_desc: 'مساند رأس مطرزة بتطريز يدوي فاخر',
                long_desc: 'مساند رأس مصنوعة من أجود أنواع الأقمشة مع تطريز يدوي فاخر. توفر الراحة والدعم للرقبة والرأس أثناء القيادة.',
                price: 150,
                stock: 40,
                category: 'إكسسوارات داخلية',
                tags: 'مساند، تطريز، راحة، فاخر',
                featured: false
            },
            {
                name: 'أضواء LED داخلية ملونة',
                image_desc: 'صورة شريط أضواء LED ملونة تضيء مقصورة السيارة بألوان متدرجة',
                short_desc: 'شريط أضواء LED قابل للتحكم في الألوان',
                long_desc: 'شريط أضواء LED حديث يمكن التحكم فيه عن طريق الهاتف المحمول. يوفر إضاءة ملونة رائعة لمقصورة السيارة مع إمكانية اختيار من مئات الألوان.',
                price: 199,
                stock: 30,
                category: 'إضاءة',
                tags: 'LED، إضاءة، ألوان، تحكم',
                featured: true
            },
            {
                name: 'كفرات مقود من الجلد الطبيعي',
                image_desc: 'صورة كفر مقود من الجلد البني الطبيعي مع خياطة متقنة',
                short_desc: 'كفر مقود من الجلد الطبيعي المدبوغ',
                long_desc: 'كفر مقود مصنوع من الجلد الطبيعي المدبوغ يدوياً. يوفر قبضة محكمة ومريحة ويحمي المقود الأصلي من التآكل.',
                price: 89,
                stock: 50,
                category: 'إكسسوارات داخلية',
                tags: 'مقود، جلد، حماية، راحة',
                featured: false
            },
            {
                name: 'منظم حقيبة صندوق السيارة',
                image_desc: 'صورة منظم أسود متعدد الجيوب لترتيب أدوات صندوق السيارة',
                short_desc: 'منظم قابل للطي لصندوق السيارة',
                long_desc: 'منظم عملي وقابل للطي مصنوع من قماش قوي ومقاوم للماء. يحتوي على جيوب متعددة لتنظيم أدوات السيارة والحقائب.',
                price: 125,
                stock: 20,
                category: 'إكسسوارات خارجية',
                tags: 'تنظيم، صندوق، طي، عملي',
                featured: false
            }
        ];
        
        // Add sample products to sheet
        const productsSheet = getSheet('Products');
        
        sampleProducts.forEach(product => {
            const productId = generateProductId();
            const timestamp = new Date().toISOString();
            
            const productRow = [
                productId,
                product.name,
                product.image_desc,
                product.short_desc,
                product.long_desc,
                product.price,
                product.stock,
                product.category,
                product.tags,
                product.featured,
                timestamp
            ];
            
            productsSheet.appendRow(productRow);
        });
        
        console.log('Sample data initialized successfully');
        return 'Sample data added successfully';
        
    } catch (error) {
        console.error('Error initializing sample data:', error);
        throw error;
    }
}

// Test function to verify setup
function testSetup() {
    try {
        const sheetId = PropertiesService.getScriptProperties().getProperty('SHEET_ID');
        const adminKey = PropertiesService.getScriptProperties().getProperty('ADMIN_KEY');
        
        if (!sheetId) {
            throw new Error('SHEET_ID not configured');
        }
        
        if (!adminKey) {
            throw new Error('ADMIN_KEY not configured');
        }
        
        // Test sheet access
        const spreadsheet = SpreadsheetApp.openById(sheetId);
        const productsSheet = spreadsheet.getSheetByName('Products');
        const ordersSheet = spreadsheet.getSheetByName('Orders');
        
        if (!productsSheet) {
            throw new Error('Products sheet not found');
        }
        
        if (!ordersSheet) {
            throw new Error('Orders sheet not found');
        }
        
        console.log('Setup test completed successfully');
        return {
            success: true,
            message: 'Setup is correct',
            sheets: ['Products', 'Orders'],
            hasAdminKey: true
        };
        
    } catch (error) {
        console.error('Setup test failed:', error);
        return {
            success: false,
            error: error.toString()
        };
    }
}