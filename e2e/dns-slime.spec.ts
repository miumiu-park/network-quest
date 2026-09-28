import { expect, test, type Page } from '@playwright/test'

async function runCommand(page: Page, command: string) {
  const terminal = page.getByRole('textbox', { name: 'コマンド' })
  await terminal.fill(command)
  await terminal.press('Enter')
}

test('VillageからDNS Slimeを解決してLearning Reviewを確認できる', async ({
  page,
}) => {
  await page.goto('/village')
  await expect(page.getByRole('heading', { name: 'LAN Village' })).toBeVisible()
  await expect(
    page.getByRole('region', { name: 'Network Questの進め方' }),
  ).toBeVisible()
  const playerStatus = page.getByRole('region', { name: 'Network Adventurer' })
  await expect(playerStatus).toContainText('Level1')
  await expect(playerStatus).toContainText('Experience0 / 100 EXP')
  await expect(playerStatus).toContainText('Quest Clear0 / 4')

  await page.getByRole('button', { name: /DNS Slime/ }).click()
  await page.getByRole('link', { name: '依頼を確認' }).click()
  await expect(page).toHaveURL(/\/event\/dns-slime$/)
  await expect(page.getByRole('heading', { name: 'Net Sage' })).toBeVisible()

  await page.getByRole('link', { name: '調査を開始' }).click()
  await expect(page).toHaveURL(/\/battle\/dns-slime$/)
  await expect(
    page
      .getByRole('navigation', { name: 'Battle進行ガイド' })
      .getByRole('listitem')
      .filter({ hasText: '調査' }),
  ).toHaveAttribute('aria-current', 'step')

  await runCommand(page, 'help')
  await expect(page.getByText(/Available commands:/)).toBeVisible()
  await runCommand(page, 'help ping')
  await expect(page.getByText(/Usage: ping <target>/)).toBeVisible()
  const terminalInput = page.getByRole('textbox', { name: 'コマンド' })
  await terminalInput.press('ArrowUp')
  await expect(terminalInput).toHaveValue('help ping')
  await terminalInput.press('ArrowUp')
  await expect(terminalInput).toHaveValue('help')
  await terminalInput.press('ArrowDown')
  await expect(terminalInput).toHaveValue('help ping')
  await runCommand(page, 'pign gateway')
  await expect(page.getByText(/command not found: pign/)).toContainText(
    'Run "help" to list available commands.',
  )

  await page.getByRole('button', { name: '次のヒントを表示' }).click()
  await expect(
    page.getByText('まずGatewayへのIP通信が成功するか確認しましょう。'),
  ).toBeVisible()
  await expect(
    page.getByText(/Gatewayと外部IPへの結果を比較/),
  ).not.toBeVisible()

  await runCommand(page, 'ping gateway')
  await expect(page.getByText(/Reply from 192\.168\.1\.1/)).toBeVisible()
  const pathFeedback = page.getByRole('region', {
    name: '通信経路の調査結果',
  })
  await expect(pathFeedback).toContainText('Gateway (gateway): 通信成功')

  await runCommand(page, 'nslookup quest.example')
  await expect(page.getByText(/configured DNS server/)).toBeVisible()
  await expect(pathFeedback).toContainText('DNS (quest.example): 通信失敗')

  await page.getByRole('button', { name: 'DNS', exact: true }).click()
  await expect(page.getByText('Weakness Found')).toBeVisible()

  await page.getByRole('button', { name: 'DNS設定を修復' }).click()
  await expect(page.getByText('REPAIRED')).toBeVisible()
  await expect(page.getByText('Stage Clear')).not.toBeVisible()

  await runCommand(page, 'nslookup quest.example')
  await expect(page.getByText('Stage Clear')).toBeVisible()
  await expect(pathFeedback).toContainText('DNS (quest.example): 通信成功')

  await page.getByRole('button', { name: 'Resultへ' }).click()
  await expect(page).toHaveURL(/\/result$/)
  await expect(page.getByText('STAGE CLEAR')).toBeVisible()
  await expect(
    page.getByRole('heading', { name: 'DNS Slime 撃破！' }),
  ).toBeVisible()
  await expect(page.getByRole('heading', { name: '+100 EXP' })).toBeVisible()
  await expect(page.getByText('Lv.1 → Lv.2')).toBeVisible()
  await expect(
    page.getByText('今回学んだテーマ: Name Resolution'),
  ).toBeVisible()
  await expect(page.getByLabel('Stage Rank A')).toBeVisible()
  await expect(page.getByText('NEW RECORD')).toBeVisible()
  await expect(page.getByLabel('Stage performance')).toContainText(
    'Commands6Wrong Answers0Hints1',
  )

  await page.getByRole('link', { name: '学習レビューへ進む' }).click()
  await expect(page).toHaveURL(/\/learning$/)
  await expect(
    page.getByRole('heading', { name: 'Learning Review' }),
  ).toBeVisible()
  await expect(
    page.getByRole('region', { name: '原因', exact: true }),
  ).toContainText('DNS')
  await expect(page.getByRole('region', { name: '使用command' })).toContainText(
    'ping',
  )
  await expect(page.getByRole('region', { name: '使用command' })).toContainText(
    'nslookup',
  )
  await expect(page.getByRole('region', { name: '次の行動' })).toContainText(
    '次におすすめ: IP Slime',
  )

  await page.getByRole('link', { name: 'LAN Villageへ戻る' }).click()
  await expect(playerStatus).toContainText('Level2')
  await expect(playerStatus).toContainText('Experience100 / 300 EXP')
  await expect(playerStatus).toContainText('Quest Clear1 / 4')
  await expect(page.getByRole('button', { name: /DNS Slime/ })).toContainText(
    'クリア済み',
  )

  await page.getByRole('link', { name: 'Network / Monster図鑑を見る' }).click()
  await expect(page).toHaveURL(/\/codex$/)
  await expect(
    page.getByRole('heading', { name: 'Network / Monster図鑑' }),
  ).toBeVisible()
  await expect(page.getByLabel('図鑑登録数')).toContainText('1 / 4 登録')
  const dnsEntry = page.getByRole('listitem', { name: 'DNS Slime 登録済み' })
  await expect(dnsEntry).toContainText('Name Resolution')
  await expect(dnsEntry).toContainText('BEST RANKA')
  await expect(
    page.getByRole('listitem', { name: '未登録Monster 1' }),
  ).toContainText('???')

  await page.reload()
  await expect(page.getByLabel('図鑑登録数')).toContainText('1 / 4 登録')
  await expect(
    page.getByRole('listitem', { name: 'DNS Slime 登録済み' }),
  ).toContainText('BEST RANKA')
  await page.getByRole('link', { name: 'LAN Villageへ戻る' }).click()
  await expect(page).toHaveURL(/\/village$/)
})
