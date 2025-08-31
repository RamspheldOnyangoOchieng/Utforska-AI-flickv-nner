#!/usr/bin/env node
require('dotenv').config({ path: '.env.local' })
require('dotenv').config({ path: '.env', override: false })
require('./apply-migrations')
