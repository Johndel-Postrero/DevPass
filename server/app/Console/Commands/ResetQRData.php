<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\QRCode;
use App\Models\EntryLog;
use Illuminate\Support\Facades\DB;

class ResetQRData extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'qr:reset {--confirm : Skip confirmation prompt}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Reset all QR code data including entry logs and QR codes';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        if (!$this->option('confirm')) {
            if (!$this->confirm('⚠️  WARNING: This will delete ALL QR codes and entry logs. This action cannot be undone. Continue?')) {
                $this->info('Operation cancelled.');
                return 0;
            }
        }

        $this->info('🔄 Resetting QR code data...');
        $this->info('');

        try {
            // Count records before deletion
            $entryLogCount = EntryLog::count();
            $qrCodeCount = QRCode::count();

            // Check for orphaned QR codes (pointing to non-existent devices)
            $orphanedQRCodes = QRCode::whereDoesntHave('device')->count();
            if ($orphanedQRCodes > 0) {
                $this->warn("⚠️  Found {$orphanedQRCodes} orphaned QR code(s) (pointing to deleted devices)");
            }

            // Disable foreign key checks temporarily (truncate doesn't work in transactions)
            DB::statement('SET FOREIGN_KEY_CHECKS=0;');

            // Delete all entry logs first (due to foreign key constraints)
            $this->info('Deleting entry logs...');
            EntryLog::truncate();
            $this->info("✓ Deleted {$entryLogCount} entry log(s)");

            // Delete all QR codes
            $this->info('Deleting QR codes...');
            QRCode::truncate();
            $this->info("✓ Deleted {$qrCodeCount} QR code(s)");

            // Re-enable foreign key checks
            DB::statement('SET FOREIGN_KEY_CHECKS=1;');

            $this->info('');
            $this->info('✅ Successfully reset all QR code data!');
            $this->info('');
            $this->info('All QR codes and entry logs have been deleted.');
            $this->info('Students will need to register new devices and generate new QR codes.');

            return 0;
        } catch (\Exception $e) {
            // Re-enable foreign key checks in case of error
            try {
                DB::statement('SET FOREIGN_KEY_CHECKS=1;');
            } catch (\Exception $e2) {
                // Ignore
            }
            $this->error('❌ Error resetting QR code data: ' . $e->getMessage());
            return 1;
        }
    }
}
