CREATE SCHEMA IF NOT EXISTS `teste` DEFAULT CHARACTER SET utf8mb3 ;

CREATE TABLE IF NOT EXISTS `teste`.`acompanhante` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `convidado_id` INT(11) NOT NULL,
  `nome` VARCHAR(255) NOT NULL,
  `telefone` VARCHAR(20) NULL DEFAULT NULL,
  `email` VARCHAR(100) NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  INDEX `convidado_id` (`convidado_id` ASC) VISIBLE,
  CONSTRAINT `acompanhante_ibfk_1`
    FOREIGN KEY (`convidado_id`)
    REFERENCES `teste`.`convidados` (`id`)
    ON DELETE CASCADE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb3;

CREATE TABLE IF NOT EXISTS `teste`.`administradores` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `nome` VARCHAR(255) NULL DEFAULT NULL,
  `cpf` VARCHAR(14) NOT NULL,
  `senha` VARCHAR(255) NOT NULL,
  `plano_id` INT(11) NOT NULL,
  `ativo` TINYINT(1) NOT NULL DEFAULT '0',
  `data_criacao` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `liberado` TINYINT(1) NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE INDEX `cpf` (`cpf` ASC) VISIBLE,
  INDEX `plano_id` (`plano_id` ASC) VISIBLE,
  CONSTRAINT `administradores_ibfk_1`
    FOREIGN KEY (`plano_id`)
    REFERENCES `teste`.`planos` (`id`))
ENGINE = InnoDB
AUTO_INCREMENT = 2
DEFAULT CHARACTER SET = utf8mb3;

CREATE TABLE IF NOT EXISTS `teste`.`convidados` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `evento_id` INT(11) NOT NULL,
  `nome` VARCHAR(255) NOT NULL,
  `telefone` VARCHAR(20) NOT NULL,
  `email` VARCHAR(255) NULL DEFAULT NULL,
  `ativo` TINYINT(1) NOT NULL DEFAULT '1',
  `data_criacao` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `confirmado` TINYINT(1) NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  INDEX `evento_id` (`evento_id` ASC) VISIBLE,
  CONSTRAINT `convidados_ibfk_1`
    FOREIGN KEY (`evento_id`)
    REFERENCES `teste`.`eventos` (`id`)
    ON DELETE CASCADE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb3;

CREATE TABLE IF NOT EXISTS `teste`.`eventos` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `imagem_evento` VARCHAR(600) NOT NULL,
  `nome` VARCHAR(255) NOT NULL,
  `descricao` TEXT NULL DEFAULT NULL,
  `data_evento` DATETIME NOT NULL,
  `local` VARCHAR(255) NOT NULL,
  `administrador_id` INT(11) NULL DEFAULT NULL,
  `ativo` TINYINT(1) NOT NULL DEFAULT '1',
  `data_criacao` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `administrador_id` (`administrador_id` ASC) VISIBLE,
  CONSTRAINT `eventos_ibfk_1`
    FOREIGN KEY (`administrador_id`)
    REFERENCES `teste`.`administradores` (`id`)
    ON DELETE CASCADE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb3;

CREATE TABLE IF NOT EXISTS `teste`.`planos` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `nome` VARCHAR(255) NOT NULL,
  `max_convidados` INT(11) NOT NULL,
  PRIMARY KEY (`id`))
ENGINE = InnoDB
AUTO_INCREMENT = 2
DEFAULT CHARACTER SET = utf8mb3;

CREATE TABLE IF NOT EXISTS `teste`.`superadministradores` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `nome` VARCHAR(255) NOT NULL,
  `cpf` VARCHAR(14) NOT NULL,
  `senha` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `cpf` (`cpf` ASC) VISIBLE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb3;