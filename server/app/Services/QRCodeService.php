<?php

namespace App\Services;

use App\Models\QRCode;
use Illuminate\Support\Str;
use Carbon\Carbon;

class QRCodeService
{
    public function getAllQRCodes()
    {
        return QRCode::with('device')->get();
    }

    public function getQRCodeById($id)
    {
        return QRCode::with('device')->findOrFail($id);
    }

    public function getQRCodeByHash($hash)
    {
        return QRCode::where('qr_code_hash', $hash)
            ->with(['device' => function($query) {
                // Include soft-deleted devices so we can check their status
                $query->withTrashed();
            }])
            ->first();
    }

    public function createQRCode(array $data)
    {
        // Generate QR hash if not provided
        if (!isset($data['qr_code_hash'])) {
            $data['qr_code_hash'] = $this->generateQRHash();
        }

        // Set generated_at if not provided (in application timezone)
        if (!isset($data['generated_at'])) {
            $data['generated_at'] = Carbon::now(config('app.timezone'));
        }

        return QRCode::create($data);
    }

    public function updateQRCode($id, array $data)
    {
        $qrCode = QRCode::findOrFail($id);
        $qrCode->update($data);
        return $qrCode;
    }

    public function deleteQRCode($id)
    {
        $qrCode = QRCode::findOrFail($id);
        $qrCode->delete();
        return true;
    }

    public function generateQRHash(): string
    {
        return hash('sha256', Str::random(40) . time());
    }

    public function isQRCodeValid($hash): bool
    {
        $qrCode = $this->getQRCodeByHash($hash);
        
        if (!$qrCode || !$qrCode->is_active) {
            return false;
        }

        if ($qrCode->expires_at && $qrCode->expires_at->isPast()) {
            return false;
        }

        return true;
    }
}

