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

  await runCommand(page, 'ping gateway')
  await expect(page.getByText(/Reply from 192\.168\.1\.1/)).toBeVisible()

  await runCommand(page, 'nslookup quest.example')
  await expect(page.getByText(/configured DNS server/)).toBeVisible()

  await page.getByRole('button', { name: 'DNS', exact: true }).click()
  await expect(page.getByText('Weakness Found')).toBeVisible()

  await page.getByRole('button', { name: 'DNS設定を修復' }).click()
  await expect(page.getByText('REPAIRED')).toBeVisible()
  await expect(page.getByText('Stage Clear')).not.toBeVisible()

  await runCommand(page, 'nslookup quest.example')
  await expect(page.getByText('Stage Clear')).toBeVisible()

  await page.getByRole('button', { name: 'Resultへ' }).click()
  await expect(page).toHaveURL(/\/result$/)
  await expect(
    page.getByRole('heading', { name: 'DNS Slime 撃破' }),
  ).toBeVisible()
  await expect(page.getByText('獲得EXP: 100')).toBeVisible()

  await page.getByRole('link', { name: '学習レビューへ' }).click()
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
  await expect(page.getByRole('button', { name: /DNS Slime/ })).toContainText(
    'クリア済み',
  )
})
