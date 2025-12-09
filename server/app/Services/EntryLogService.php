<?php

namespace App\Services;

use App\Models\EntryLog;
use Carbon\Carbon;

class EntryLogService
{
    public function getAllEntryLogs($limit = 50, $securityGuardId = null)
    {
        $query = EntryLog::with(['qrCode.device.student', 'gate', 'securityGuard']);
        
        // Filter by security guard if provided
        if ($securityGuardId) {
            $query->where('security_guard_id', $securityGuardId);
        }
        
        return $query->orderBy('scan_timestamp', 'desc')
            ->limit($limit)
            ->get();
    }

    public function getEntryLogById($id)
    {
        return EntryLog::with(['qrCode.device.student', 'gate', 'securityGuard'])
            ->findOrFail($id);
    }

    public function getEntryLogsByGate($gateId, $limit = 50, $securityGuardId = null)
    {
        $query = EntryLog::where('gate_id', $gateId);
        
        // Filter by security guard if provided
        if ($securityGuardId) {
            $query->where('security_guard_id', $securityGuardId);
        }
        
        return $query->with(['qrCode.device.student', 'gate', 'securityGuard'])
            ->orderBy('scan_timestamp', 'desc')
            ->limit($limit)
            ->get();
    }

    public function getEntryLogsByStudent($studentId, $limit = 50)
    {
        return EntryLog::whereHas('qrCode.device', function ($query) use ($studentId) {
                $query->where('student_id', $studentId);
            })
            ->with(['qrCode.device', 'gate', 'securityGuard'])
            // Show both approved (success) and denied (failed) entries
            ->orderBy('scan_timestamp', 'desc')
            ->limit($limit)
            ->get();
    }

    public function getEntryLogsByDate($date, $gateId = null)
    {
        $query = EntryLog::whereDate('scan_timestamp', $date);
        
        if ($gateId) {
            $query->where('gate_id', $gateId);
        }
        
        return $query->get();
    }

    public function createEntryLog(array $data)
    {
        // Set scan_timestamp if not provided (in application timezone)
        if (!isset($data['scan_timestamp'])) {
            $data['scan_timestamp'] = Carbon::now(config('app.timezone'));
        }

        // If qr_code_hash is provided but qr_id is not, find the QR code and get its ID
        if (isset($data['qr_code_hash']) && !isset($data['qr_id'])) {
            $qrCode = \App\Models\QRCode::where('qr_code_hash', $data['qr_code_hash'])->first();
            if ($qrCode && $qrCode->qr_id) {
                $data['qr_id'] = $qrCode->qr_id;
            } else {
                \Log::error('QR code not found for hash: ' . $data['qr_code_hash']);
                throw new \Exception('QR code not found in database. Hash: ' . ($data['qr_code_hash'] ?? 'null'));
            }
        }
        
        // Ensure qr_id is set (required field)
        if (!isset($data['qr_id'])) {
            \Log::error('qr_id is missing from entry log data', $data);
            throw new \Exception('qr_id is required for entry log creation');
        }

        return EntryLog::create($data);
    }

    public function getStats($gateId = null, $date = null, $securityGuardId = null)
    {
        $date = $date ? Carbon::parse($date) : Carbon::today();
        
        $query = EntryLog::whereDate('scan_timestamp', $date);
        
        if ($gateId) {
            $query->where('gate_id', $gateId);
        }
        
        // Filter by security guard if provided
        if ($securityGuardId) {
            $query->where('security_guard_id', $securityGuardId);
        }
        
        $totalScans = $query->count();
        $successCount = $query->where('status', 'success')->count();
        $successRate = $totalScans > 0 ? round(($successCount / $totalScans) * 100) : 0;
        $lastHour = $query->where('scan_timestamp', '>=', Carbon::now(config('app.timezone'))->subHour())->count();
        
        return [
            'scansToday' => $totalScans,
            'successRate' => $successRate,
            'lastHour' => $lastHour,
        ];
    }
}

