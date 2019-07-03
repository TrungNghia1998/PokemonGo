var ExpAction = require('../models/expaction');

//Hiển thị danh sách tất cả kinh nghiệm.
exports.expaction_list = function (req, res) {
    res.send('NOT IMPLEMENTED: Exp list');
};

// Hiển thị thông tin chi tiết kinh nghiệm.
exports.expaction_detail = function(req, res) {
    res.send('NOT IMPLEMENTED: Exp detail: ' + req.params.id);
};

// Hiển thị form tạo kinh nghiệm bằng GET.
exports.expaction_create_get = function(req, res) {
    res.send('NOT IMPLEMENTED: Exp create GET');
};

// Xử lý tạo kinh nghiệm bằng POST.
exports.expaction_create_post = function(req, res) {
    res.send('NOT IMPLEMENTED: Exp create POST');
};

// Hiển thị form xóa kinh nghiệm bằng GET.
exports.expaction_delete_get = function(req, res) {
    res.send('NOT IMPLEMENTED: Exp delete GET');
};

// Xử lý xóa kinh nghiệm bằng POST.
exports.expaction_delete_post = function(req, res) {
    res.send('NOT IMPLEMENTED: Exp delete POST');
};

// Hiển thị cập nhật kinh nghiệm bằng GET.
exports.expaction_update_get = function(req, res) {
    res.send('NOT IMPLEMENTED: Exp update GET');
};

// Xử lý cập nhật kinh nghiệm bằng POST.
exports.expaction_update_post = function(req, res) {
    res.send('NOT IMPLEMENTED: Exp update POST');
};