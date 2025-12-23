---
description: A description of your rule
---

luôn trả lời với user bằng tiếng việt
nếu thay đổi, thêm, xoá, sửa files, folders, update cây thư mục.

cây thư mục:
src
├── app.module.ts
├── main.ts
├── modules
│   ├── auth
│   │   ├── auth.module.ts
│   │   ├── auth.service.ts
│   │   ├── auth.controller.ts
│   │   ├── dto
│   │   │   ├── login.dto.ts
│   │   │   ├── register.dto.ts
│   │   │   ├── refresh-token.dto.ts
│   │   │   └── auth-response.dto.ts
│   │   ├── guards
│   │   │   ├── jwt-access.guard.ts
│   │   │   └── jwt-refresh.guard.ts
│   │   ├── interfaces
│   │   │   ├── jwt-payload.interface.ts
│   │   │   └── refresh-token.interface.ts
│   │   ├── strategies
│   │   │   ├── jwt-access.strategy.ts
│   │   │   └── jwt-refresh.strategy.ts
│   ├── users
│   │   ├── users.module.ts
│   │   ├── users.service.ts
│   │   ├── user.entity.ts
│   │   └── dto
│   │       ├── create-user.dto.ts
│   │       └── update-user.dto.ts
│   ├── funds
│   │   ├── funds.module.ts
│   │   ├── funds.service.ts
│   │   ├── funds.controller.ts
│   │   ├── entity
│   │   │   ├── fund.entity.ts
│   │   │   ├── fund-member.entity.ts
│   │   │   └── fund-join-request.entity.ts
│   │   ├── dto
│   │   │   ├── create-fund.dto.ts
│   │   │   ├── update-fund.dto.ts
│   │   │   ├── add-member.dto.ts
│   │   │   ├── update-member-role.dto.ts
│   │   │   ├── close-dialog-cate.dto.ts
│   │   │   ├── membership-status.dto.ts
│   │   │   ├── public-fund-info.dto.ts
│   │   │   ├── fund.dto.ts
│   │   │   └── fund-last-message.dto.ts
│   ├── categories
│   │   ├── categories.module.ts
│   │   ├── categories.service.ts
│   │   ├── categories.controller.ts
│   │   ├── category.entity.ts
│   │   ├── fund-category.entity.ts
│   │   ├── default-categories.ts
│   │   └── dto
│   │       ├── create-category.dto.ts
│   │       ├── update-category.dto.ts
│   ├── messages
│   │   ├── messages.module.ts
│   │   ├── messages.service.ts
│   │   ├── messages.controller.ts
│   │   ├── message.entity.ts
│   │   └── dto
│   │       ├── create-message.dto.ts
│   │       └── update-message.dto.ts
│   ├── transactions
│   │   ├── transactions.module.ts
│   │   ├── transactions.service.ts
│   │   ├── transactions.controller.ts
│   │   └── transaction.entity.ts
│   ├── ai
│   │   ├── ai.module.ts
│   │   ├── model.service.ts
│   │   ├── ai-request-log.entity.ts
│   │   └── interfaces
│   │       └── parsed-expense.interface.ts
│   └── statistics
│       ├── statistics.module.ts
│       ├── statistics.service.ts
│       └── statistics.controller.ts
├── common
│   ├── base.entity.ts
│   ├── decorators
│   │   ├── current-user.decorator.ts
│   ├── dto
│   │   └── page-options.dto.ts
│   ├── logger
│   │   ├── logger.module.ts
│   ├── swagger
│   │   └── api-property-optional-custom.decorator.ts
├── config
│   ├── configuration.ts
│   ├── env.validation.ts
│   ├── swagger.config.ts
├── database
│   ├── database-logger.ts
├── worker/

prisma/
├── schema.prisma
├── dev.db

tests/
├── integration
│   ├── auth.e2e-spec.ts
│   ├── funds.e2e-spec.ts
│   ├── categories.e2e-spec.ts
│   ├── messages.e2e-spec.ts
│   ├── transactions.e2e-spec.ts
│   ├── ai.e2e-spec.ts
│   └── statistics.e2e-spec.ts
├── unit
│   ├── auth.spec.ts
│   ├── funds.spec.ts
│   ├── categories.spec.ts
│   ├── messages.spec.ts
│   ├── transactions.spec.ts
│   ├── ai.spec.ts
│   └── statistics.spec.ts

.env.example
.env.develop
.env.local
.env.production
.gitignore
.prettierrc
.eslintrc.js
tsconfig.json
package.json
package-lock.json
README.md
nest-cli.json
vercel.json

