INSERT INTO EducationalMaterial (Id, UsersUserName)
VALUES (1, 'admin');

INSERT INTO Material (Id, Link, EducationalMaterialId)
VALUES (1, '', 1);

INSERT INTO Record (Id, FilePath, OriginalFileName, FileSize, MimeType, Format, MaterialId, FileKey, FileBucket)
VALUES (1, 'https://aoe.object.pouta.csc.fi/Introduktiontillartificiellintelligens-1576067361214.pdf',
        'Introduktion till artificiell intelligens.pdf', 820270, 'application/pdf', '7bit', 1,
        'Introduktiontillartificiellintelligens-1576067361214.pdf', 'aoe');
