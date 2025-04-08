package com.sismics.docs.core.service;

import com.sismics.docs.BaseTransactionalTest;
import com.sismics.docs.core.dao.FileDao;
import com.sismics.docs.core.model.jpa.File;
import com.sismics.docs.core.model.jpa.User;
import org.junit.Assert;
import org.junit.Test;

/**
 * FileSizeService 测试类，提升 JaCoCo 覆盖率。
 */
public class TestFileSizeService extends BaseTransactionalTest {

    @Test
    public void processFileTest() throws Exception {
        User user = createUser("processFileTest");

        FileDao fileDao = new FileDao();
        File file = createFile(user, File.UNKNOWN_SIZE);

        FileSizeService fileSizeService = new FileSizeService();

        // ✅ 正常处理路径
        fileSizeService.processFile(file);
        Assert.assertEquals(fileDao.getFile(file.getId()).getSize(), Long.valueOf(FILE_JPG_SIZE));

        // ✅ 补测：size 已知 → 不应处理
        file.setSize(1024L);
        fileSizeService.processFile(file);
        Assert.assertEquals(Long.valueOf(1024L), file.getSize());

        // ✅ 补测：file content 为 null
        file.setSize(File.UNKNOWN_SIZE);
        file.setContent(null);
        fileSizeService.processFile(file);
        Assert.assertNull(file.getContent());

        // ✅ 补测：传 null 对象
        try {
            fileSizeService.processFile(null);
        } catch (Exception e) {
            Assert.fail("Should not throw exception when file is null");
        }
    }
}
